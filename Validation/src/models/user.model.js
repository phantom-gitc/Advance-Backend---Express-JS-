import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        min:10,
        max:12,
        match:/^[6-9][0-9]{9}$/
    }
  
}, {
    timestamps : true
})


const userModel = mongoose.model("user",userSchema);

export default userModel;