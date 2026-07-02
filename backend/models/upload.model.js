import mongoose from "mongoose";

const uploadModel=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    size:{
        type:Number,
        require:true
    },
    extname:{
        type:String,
        require:true
    },
    url:{
        type:String,
        require:true
    }
})

export default mongoose.model("uploadModel",uploadModel)