import dotenv from "dotenv";
dotenv.config();


if(!process.env.PORT){
    throw new Error("PORT is not defined ❌");
}


if(!process.env.MONGODB_URL){
    throw new Error("MONGODB_URL is not defined ❌");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined ❌");
}

if(!process.env.ACCESS_TOKEN_SECRET){
    throw new Error("ACCESS_TOKEN_SECRET is not defined ❌");
}



if(!process.env.REFRESH_TOKEN_SECRET){
    throw new Error("REFRESH_TOKEN_SECRET is not defined ❌");
}

const Config = {
    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
}

export default Config;