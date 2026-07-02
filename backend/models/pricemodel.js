import mongoose from "mongoose";

const Modelprice=new mongoose.Schema({
    name:{
        type:String,
        require:true,
        unique:true
    },
    price:{
        type:Number,
        require:true
    },
    description:{
        type:String,
        require:true
    }
})

const modelprice=mongoose.model("modelPrice",Modelprice,"masud_one")

export default modelprice;