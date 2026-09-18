
import mongoose from 'mongoose';


const urlSchema = new mongoose.Schema({
    orignalUrl : {
        type : String,
        required : true,
    },
    shortUrl : {
        type : String,
        required : true,
    },
    clickedCount : {
        type : Number,
        default : 0,
    },
    customName : {
        type : String,
        default : ""
    }
},{timestamps : true});

const urlModel = mongoose.model("urls",urlSchema);

export default urlModel;