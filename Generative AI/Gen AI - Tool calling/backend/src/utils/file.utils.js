import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
// [LANGCHAIN]: Import tool helper from LangChain to expose native functions to the LLM
import { tool } from "@langchain/core/tools";
// [LANGCHAIN]: Zod schemas define parameter validation and JSON Schema sent to the LLM
import { z } from "zod";

/**
 * Resolves a user-requested path and ensures it stays strictly inside the workspace.
 * Prevents directory traversal attacks and protects sensitive files (.git, .env, node_modules).
 */
async function resolveSafePath(workspace, requestedPath = ".") {
  const resolved = path.resolve(workspace, requestedPath);
  const relative = path.relative(workspace, resolved);

  // Check if target escapes the workspace directory
  const isEscaping =
    relative.startsWith("..") || path.isAbsolute(relative);
  if (isEscaping) {
    throw new Error("Access denied: path is outside the project workspace.");
  }

  // Prevent modifying internal dependencies and secrets
  const parts = relative.split(path.sep);
  const isProtected = parts.some(
    (part) =>
      part === ".git" ||
      part === "node_modules" ||
      part === ".env" ||
      part.startsWith(".env.")
  );
  if (isProtected) {
    throw new Error("Access denied: protected file or directory (.git, .env, node_modules).");
  }

  return resolved;
}

/**
 * Builds the file-system toolset provided to the LangGraph agent.
 * [LANGCHAIN]: Every tool returned here is wrapped using LangChain's tool() decorator.
 */
export function createFileTools(workspace, confirmAction) {
  // Tool 1: List directory contents
  const listFiles = tool(
    async ({ path: dirPath = "." }) => {
      try {
        const target = await resolveSafePath(workspace, dirPath);
        const entries = await readdir(target, { withFileTypes: true });

        const items = entries
          .filter(
            (e) =>
              e.name !== ".git" &&
              e.name !== "node_modules" &&
              e.name !== ".env" &&
              !e.name.startsWith(".env.")
          )
          .map((e) => (e.isDirectory() ? `[dir]  ${e.name}` : `       ${e.name}`));

        return items.length ? items.join("\n") : "(empty directory)";
      } catch (err) {
        return `Error listing directory: ${err.message}`;
      }
    },
    {
      name: "list_files",
      description: "List files and folders in a workspace directory to inspect project structure.",
      schema: z.object({
        path: z.string().optional().describe("Directory path relative to workspace. Defaults to '.'"),
      }),
    }
  );

  // Tool 2: Read file content
  const readFileTool = tool(
    async ({ path: filePath }) => {
      try {
        const target = await resolveSafePath(workspace, filePath);
        return await readFile(target, "utf8");
      } catch (err) {
        return `Error reading file: ${err.message}`;
      }
    },
    {
      name: "read_file",
      description: "Read the full UTF-8 text content of a file inside the workspace.",
      schema: z.object({
        path: z.string().describe("Relative file path to read"),
      }),
    }
  );

  // Tool 3: Create directory (and nested parents)
  const makeDirectoryTool = tool(
    async ({ path: dirPath }) => {
      try {
        if (!dirPath?.trim()) return "Error: Directory path cannot be empty.";
        const target = await resolveSafePath(workspace, dirPath);
        const relative = path.relative(workspace, target) || ".";

        await mkdir(target, { recursive: true });
        return `Successfully created directory: ${relative}`;
      } catch (err) {
        return `Error creating directory: ${err.message}`;
      }
    },
    {
      name: "make_directory",
      description: "Create a new folder or nested directory path in the workspace.",
      schema: z.object({
        path: z.string().describe("Relative folder path to create (e.g. 'src/utils')"),
      }),
    }
  );

  // Tool 4: Write / create a file
  const writeFileTool = tool(
    async ({ path: filePath, content }) => {
      try {
        const target = await resolveSafePath(workspace, filePath);
        const relative = path.relative(workspace, target);

        // Ask user confirmation before modifying disk
        const allowed = await confirmAction(relative, "write");
        if (!allowed) return `Write cancelled by user for: ${relative}`;

        // Ensure parent directory exists before writing
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, content, "utf8");
        return `Successfully wrote ${content.length} characters to ${relative}`;
      } catch (err) {
        return `Error writing file: ${err.message}`;
      }
    },
    {
      name: "write_file",
      description: "Write full content to a file in the workspace. Automatically creates parent directories.",
      schema: z.object({
        path: z.string().describe("Relative file path (e.g. 'src/app.js')"),
        content: z.string().describe("Complete text content to write into the file"),
      }),
    }
  );

  // Tool 5: Surgical text replacement
  const editFileTool = tool(
    async ({ path: filePath, target: targetText, replacement }) => {
      try {
        const fullPath = await resolveSafePath(workspace, filePath);
        const relative = path.relative(workspace, fullPath);

        const allowed = await confirmAction(relative, "edit");
        if (!allowed) return `Edit cancelled by user for: ${relative}`;

        const original = await readFile(fullPath, "utf8");
        if (!original.includes(targetText)) {
          return `Error: Target text not found in ${relative}`;
        }

        const updated = original.replace(targetText, replacement);
        await writeFile(fullPath, updated, "utf8");
        return `Successfully updated ${relative}`;
      } catch (err) {
        return `Error editing file: ${err.message}`;
      }
    },
    {
      name: "edit_file",
      description: "Replace a specific substring in an existing file with new content.",
      schema: z.object({
        path: z.string().describe("Relative file path to edit"),
        target: z.string().describe("The exact text snippet to replace"),
        replacement: z.string().describe("The replacement text snippet"),
      }),
    }
  );

  // Tool 6: Delete file or directory
  const deleteFileTool = tool(
    async ({ path: targetPath }) => {
      try {
        const target = await resolveSafePath(workspace, targetPath);
        const relative = path.relative(workspace, target);

        if (target === workspace) {
          return "Error: Cannot delete workspace root.";
        }

        const allowed = await confirmAction(relative, "delete");
        if (!allowed) return `Delete cancelled by user for: ${relative}`;

        const info = await stat(target);
        if (info.isDirectory()) {
          await rm(target, { recursive: true, force: true });
          return `Successfully deleted directory: ${relative}`;
        }

        await unlink(target);
        return `Successfully deleted file: ${relative}`;
      } catch (err) {
        return `Error deleting path: ${err.message}`;
      }
    },
    {
      name: "delete_file",
      description: "Delete a file or directory inside the workspace.",
      schema: z.object({
        path: z.string().describe("Relative path of the file or folder to delete"),
      }),
    }
  );

  return [
    listFiles,
    readFileTool,
    makeDirectoryTool,
    writeFileTool,
    editFileTool,
    deleteFileTool,
  ];
}
