import dotenv from "dotenv";
dotenv.config();


if(!process.env.MONGODB_URI){
    throw new Error("MONGODB_URI is not defined");
}


const config={
    MONGODB_URI:process.env.MONGODB_URI,
    PORT:process.env.PORT || 3000
}


export default config;