import ImageKit from "imagekit";
import Config from "./config.js";

const imagekit = new ImageKit({
    publicKey: Config.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: Config.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: Config.IMAGEKIT_URL_ENDPOINT || "",
});

// Re-export upload helper from service for convenience
export { uploadToImageKit } from "../services/imageKit.service.js";

export default imagekit;
