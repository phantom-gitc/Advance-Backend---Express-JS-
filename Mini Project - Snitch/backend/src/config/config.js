import dotenv from "dotenv";
dotenv.config();


if(!process.env.PORT){
    throw new Error("PORT is not defined ❌");
}


if(!process.env.MONGODB_URL){
    throw new Error("MONGODB_URL is not defined ❌");
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
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
}

export default Config;