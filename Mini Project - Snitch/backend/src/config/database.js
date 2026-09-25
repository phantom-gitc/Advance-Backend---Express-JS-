import dns from "dns";
import mongoose from "mongoose"
import Config from "./config.js";
dns.setServers(["8.8.8.8", "1.1.1.1"]);




async function connectDB() {
    
    try {
        await mongoose.connect(Config.MONGODB_URL);
        console.log("MongoDB connected successfully ✅");
    } catch (error) {
        console.log("Error connecting to MongoDB ❌", error);
    }
}

export default connectDB;