import imagekit from "../config/imagekit.config.js";
import Config from "../config/config.js";

// Upload a single file to ImageKit and get back the URL
export const uploadToImageKit = async (file, folder = "/products") => {
    // Quick check to make sure our ImageKit keys are ready in .env
    if (!Config.IMAGEKIT_PUBLIC_KEY || !Config.IMAGEKIT_PRIVATE_KEY || !Config.IMAGEKIT_URL_ENDPOINT) {
        throw new Error("ImageKit credentials are not configured in .env");
    }

    // Convert the incoming file buffer into base64 so ImageKit can process it
    const base64File = file.buffer.toString("base64");

    // Add a timestamp to the file name so uploaded images never overwrite each other
    const fileName = `${Date.now()}-${file.originalname}`;

    // Send the image over to ImageKit
    const response = await imagekit.upload({
        file: base64File,
        fileName: fileName,
        folder: folder,
    });

    // Return the image URL so we can store it in our database
    return response.url;
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
