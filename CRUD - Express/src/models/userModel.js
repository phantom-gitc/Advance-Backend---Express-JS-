import mongoose from "mongoose";

// User schema definition
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    age: {
        type: Number,
        required: true,
        min: 1
    }
}, { timestamps: true });

export const user = mongoose.model("user", userSchema);
export const User = user;
export default user;
