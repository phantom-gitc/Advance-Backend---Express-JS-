import ImageKit from "imagekit";
import Config from "./config.js";

const imagekit = new ImageKit({
    publicKey: Config.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: Config.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: Config.IMAGEKIT_URL_ENDPOINT || "",
});

export const uploadToImageKit = async (file, folder = "/products") => {
    if (!Config.IMAGEKIT_PUBLIC_KEY || !Config.IMAGEKIT_PRIVATE_KEY || !Config.IMAGEKIT_URL_ENDPOINT) {
        throw new Error("ImageKit credentials are not configured in .env");
    }

    const response = await imagekit.upload({
        file: file.buffer.toString("base64"),
        fileName: `${Date.now()}-${file.originalname}`,
        folder: folder,
    });

    return response.url;
};

export default imagekit;
