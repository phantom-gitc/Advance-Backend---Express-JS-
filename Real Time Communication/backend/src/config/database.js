import dns from "dns";
import mongoose from "mongoose"
import config from "./config.js"
dns.setServers(["8.8.8.8", "1.1.1.1"])


const connectDB = async ()=>{
    try {
        
        await mongoose.connect(config.MONGO_URI);
        console.log("Database connected successfully 🌚");
        
    } catch (error) {
        console.error("Database connection failed", error);
        process.exit(1);
    }
}


export default connectDB;
