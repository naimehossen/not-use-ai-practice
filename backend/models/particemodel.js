import mongoose from "mongoose";

const particeSchemia=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
})


const particeModel = mongoose.model("particeModel", particeSchemia);
export default particeModel;