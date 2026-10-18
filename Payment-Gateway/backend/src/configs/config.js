import dotenv from "dotenv";
dotenv.config();


if(!process.env.MONGO_URI){
    console.error("MONGO_URI is not defined");
    process.exit(1);
}

if(!process.env.RAZORPAY_KEY_ID){
    console.error("RAZORPAY_KEY_ID is not defined");
    process.exit(1);
}

if(!process.env.RAZORPAY_KEY_SECRET){
    console.error("RAZORPAY_KEY_SECRET is not defined");
    process.exit(1);
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET
};