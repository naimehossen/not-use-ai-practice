import mongoose from 'mongoose'


const model=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
        
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        trim:true,
        minlength:8,
        maxlength:72,
        required:true,
        type:String
    }

})

const mongomodel=mongoose.model("model",model)

export default mongomodel;

