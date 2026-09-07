import dotenv from "dotenv";
dotenv.config();


if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is required")
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is required")
}
let config = {

    MONGO_URI : process.env.MONGO_URI,
    JWT_SECRET : process.env.JWT_SECRET
}


export default config ;