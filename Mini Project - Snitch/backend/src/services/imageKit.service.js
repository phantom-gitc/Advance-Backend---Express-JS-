import imagekit from "../config/imagekit.config.js";
import Config from "../config/config.js";

import fs from "fs";
import path from "path";

// Upload a single file to ImageKit with robust local storage fallback
export const uploadToImageKit = async (file, folder = "/products") => {
    // Add a timestamp and safe name to the file name so uploaded images never overwrite each other
    const safeName = (file.originalname || "image.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;

    // 1. Try ImageKit if credentials are present
    if (Config.IMAGEKIT_PUBLIC_KEY && Config.IMAGEKIT_PRIVATE_KEY && Config.IMAGEKIT_URL_ENDPOINT) {
        try {
            const base64File = file.buffer.toString("base64");
            const response = await imagekit.upload({
                file: base64File,
                fileName: fileName,
                folder: folder,
            });
            if (response && response.url) {
                return response.url;
            }
        } catch (ikError) {
            console.warn("⚠️ ImageKit upload warning (falling back to local disk storage):", ikError.message);
        }
    }

    // 2. Fallback to local storage in uploads/products
    try {
        const uploadDir = path.join(process.cwd(), "uploads", "products");
        await fs.promises.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await fs.promises.writeFile(filePath, file.buffer);
        return `/uploads/products/${fileName}`;
    } catch (fsError) {
        console.error("❌ Failed to save file locally:", fsError);
        throw new Error("Failed to process and store uploaded image: " + fsError.message);
    }
};

// Handy helper if you ever need to upload multiple images together
export const uploadMultipleToImageKit = async (files = [], folder = "/products") => {
    if (!files || files.length === 0) return [];

    // Upload all files at the same time to save time
    const uploadPromises = files.map((file) => uploadToImageKit(file, folder));
    return await Promise.all(uploadPromises);
};

export default {
    uploadToImageKit,
    uploadMultipleToImageKit,
};
