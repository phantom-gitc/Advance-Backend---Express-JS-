# Autonomous CLI Coding Agent

A powerful, interactive terminal coding agent (like Claude Code) built with LangGraph and Groq. It acts autonomously in your workspace: creating folders, writing code, editing files, running terminal commands, and testing your application.

## Features

- **Autonomous Tool Execution**: Creates directories, writes code, edits files, and runs shell commands directly on disk—not just echoing text to the terminal.
- **Claude Code-like CLI Interface**:
  - Live progress display showing agent actions, arguments, and execution results.
  - Interactive approval prompts with `[y/N/a(all)]` to allow single actions or auto-approve the whole session.
  - `-y` / `--auto` flag for fully autonomous execution.
  - Built-in session commands: `/auto`, `/status`, `/clear`, `/help`, `/exit`.
- **Full Workspace Toolset**:
  - `make_directory`: Create directories and nested folder structures.
  - `write_file`: Create or overwrite files with code (auto-creates parent directories).
  - `edit_file`: Surgically replace text in existing files.
  - `read_file`: Inspect code and documentation.
  - `list_files`: Discover project files and explore directories.
  - `execute_command`: Run any terminal command in the workspace (npm, node, git, etc.).
  - `delete_file`: Delete files or directories when explicitly requested.
- **Security & Protection**:
  - Operations are confined to the selected workspace.
  - Protected paths (`.env`, `.git`, `node_modules`) are guarded against accidental overwrite or leaks.
  - Child processes do not inherit sensitive API keys.

## Quick Start

### 1. Link the CLI globally (optional)

```bash
cd backend
npm link
```

### 2. Run the agent

From any folder:

```bash
# Start in current folder
agent

# Or run with Node directly
node backend/cli.js

# Target a specific workspace folder
agent "C:\path\to\your\project"

# Run in autonomous mode (auto-approves file writes and commands)
agent -y
```

### 3. API Key Setup

Add your Groq API key to `backend/.env`:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Or the CLI will prompt you on first run and safely store it in your user settings.

## Session Commands

- `/auto` - Toggle auto-approval mode on or off.
- `/status` - View current workspace, active model, and session settings.
- `/clear` - Reset conversation memory.
- `/help` - Show available commands.
- `/exit` - Exit the agent session.
