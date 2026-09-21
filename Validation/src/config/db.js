import dns from "node:dns";
import mongoose from "mongoose";
import config from "./config.js";

// Fix for Windows querySrv ECONNREFUSED with MongoDB Atlas
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log("Mongo DB Connected ❤️");
  } catch (error) {
    console.log("Error to connect Mongo DB:", error.message);
    throw error;
  }
}

export default connectDB;

