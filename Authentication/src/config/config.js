import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables");
}

if (!process.env.ACCESS_SECRET && !process.env.JWT_SECRET) {
  throw new Error("ACCESS_SECRET is required in environment variables");
}

if (!process.env.REFRESH_SECRET) {
  throw new Error("REFRESH_SECRET is required in environment variables");
}

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  ACCESS_SECRET: process.env.ACCESS_SECRET || process.env.JWT_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
};

export default config;