import dns from "dns"; 
import config from "./config.js";
import mongoose from "mongoose"

dns.setServers(["8.8.8.8", "1.1.1.1"]);



async function connectDatabase() {
    try {
        
        await mongoose.connect(config.MONGO_URI)
        console.log("Database connected successfully ❤️");
        
    } catch (error) {
        console.log("Error in connecting to database ❌❌" , error);
        process.exit(1);
    }
}


export default connectDatabase;