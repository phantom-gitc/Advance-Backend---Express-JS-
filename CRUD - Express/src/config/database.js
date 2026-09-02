import dns from "dns";
import mongoose from "mongoose";
import config from "./config.js";

// Fix DNS resolution for MongoDB Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1);
    }
}

export default connectDB;
