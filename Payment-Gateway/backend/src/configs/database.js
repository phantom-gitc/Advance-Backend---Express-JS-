import dns from "dns";
import mongoose from "mongoose";
import { config } from "./config.js";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("MongoDB connected  successfully✅");
    } catch (error) {
        console.log("MongoDB connection error ❌", error);
        process.exit(1);
    }
};

export default connectDB;