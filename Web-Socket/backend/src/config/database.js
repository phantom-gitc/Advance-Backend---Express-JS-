import dns from 'dns'
import mongoose from 'mongoose';
import { config } from './config.js';
dns.setServers(['8.8.8.8' , '8.8.4.4'])

const connectDB = async ()=>{
    try {

        await mongoose.connect(config.MONGO_URI);
        console.log('Connected to MongoDB 🌚');
        
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export default connectDB;
