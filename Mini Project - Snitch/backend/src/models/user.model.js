import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["seller", "user"],
        default: "user",
    },
    refreshToken: {
        type: String,
        required: false,
    },


}, { timestamps: true })


const userModel = mongoose.model("user", userSchema);   
export default userModel;   