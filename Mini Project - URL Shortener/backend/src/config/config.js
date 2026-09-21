import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variable ❌❌");
}

const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

export default config;