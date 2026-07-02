import particeModel from "../models/particemodel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import modelprice from "../models/pricemodel.js";

dotenv.config()




export const registerPartice=async(req,res)=>{
        const {name,email,password}=req.body;
        try {
            if (!name) {
             return   res.status(400).json({message:"error name"})
            }
             if (!email) {
              return  res.status(400).json({message:"error email"})
            }
             if (!password) {
             return   res.status(400).json({message:"error password"})
            }

            const hashpassword=await bcrypt.hash(password,10);

            const modemail=await particeModel.findOne({email})
            if (modemail) {
           return res.status(409).json({message:"email exits"})
            }

            const user=await particeModel.create({
                name,
                email,
                password:hashpassword
            })

            const newUser={
                id:user._id,
                name:user.name,
                email:user.email
            }

            const data=await particeModel.find().select("_id name email");

            res.status(200).json({
                success:true,
                oneData:newUser,
                allData:data,
                message:"success register",
                register:true
            })

        } catch (error) {
            res.status(500).json({success:false,message:"error"})
        }

}

export const login=async (req,res)=>{

    const {email,password}=req.body;

    try {
        const user=await particeModel.findOne({email});
        const checkPass =  await bcrypt.compare(password,user.password);
        

        if (!checkPass) {
            return res.status(200).json({password:"password not match"})
        }
        


        const token=jwt.sign({
            id:user._id,
            name:user.name,
            email:user.email
        },
    process.env.JWT_SECRET,
    {
        expiresIn:"1year"
    }
    )

        res.status(201).json({
            success:true,
            token:token,
            message:"login success full"
        })


    } catch (error) {
        res.status(200).json({success:false,messageerr:"error"})
    }
  



        
     
}

export const updatePartice=async(req,res)=>{
    const {id}=req.params;
    const {name,email,password}=req.body;

    try {
        const updatedData=await particeModel.findByIdAndUpdate(id,{name },{new:true})

        res.json({success:true,updatedData})
    } catch (error) {
          res.json({success:false, error})  
    }

}


export const deletePartice=async(req,res)=>{

    const {id}=req.params;

    try {
        const deleteData=await particeModel.findByIdAndDelete(id);

        res.json({success:true,deleteData})
    } catch (error) {
           res.json({success:false,error}) 
    }

}


export const listPartice =async(req,res)=>{
    
    try {
            const users=await particeModel.find()
            res.json({success:true,users})
    } catch (error) {
        res.json({success:false,error})
    }
}


export const price= async(req,res)=>{

    const {name,price,description}=req.body;

    try {
        const pricemodel=await modelprice.create({
            name,
            price,
            description
        })

        const allprice=await modelprice.find()

        res.status(200).json({success:true,message:"model create price",allmodel:allprice})
    } catch (error) {
        res.status(200).json({success:false,message:"model create price error"})
        
    }



}

export const gett=async(req,res)=>{
    try {
        const data= await modelprice.find({})

        res.status(201).json({success:true,da:data})
    } catch (error) {
            res.status(200).json({success:false,error})
    }
}