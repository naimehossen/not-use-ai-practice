import express from "express";
import { createUser, facebookLogin, googleLogin, list, loginUser, placeOrder, registerUser, verifyOrder } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js"; // যদি টোকেন চেক করতে চান
import { deletePartice, gett, listPartice, login, price, registerPartice, updatePartice } from "../controllers/particeController.js";
import multer from "multer";
import path from "path";
import fs from 'fs'

const router = express.Router();

// ১. ইউজার এবং লিস্ট রাউট
router.post("/naime", createUser); 
router.get("/list", list);

// ২. অর্ডার এবং পেমেন্ট রাউট (এগুলো সাধারণত POST হয়)
router.post("/place",placeOrder); 

// ৩. পেমেন্ট ভেরিফিকেশন রাউট (এটিই আপনার শেষ লজিক্যাল ধাপ)
router.post("/verify", verifyOrder); 

router.post("/register", registerUser);

router.post("/login",loginUser)

router.post("/google-login", googleLogin);

router.post("/facebook-login", facebookLogin);

router.post("/particeregister", registerPartice);
router.put("/partice/:id", updatePartice);
router.delete("/partice/:id", deletePartice);
router.get("/partice", listPartice);
router.post("/partice/login",login);
router.post("/price",price);
router.get("/gprice",gett);

const limits={
    fileSize:5*1212*1222
}
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'naime/')
    } ,

    filename:(req,file,cb)=>{

        const filetest=file.originalname;
        const nnnn="______";
        

        const newfile=Date.now() +nnnn+ filetest;

    cb(null,newfile)
    }
})

const filefilter=(req,file,cb)=>{
    const allowformat=['audio/x-m4a','image/png',"application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    if (allowformat.includes(file.mimetype)) {
        cb(null,true)
    }

}


const upload=multer({
    storage:storage,
    fileFilter:filefilter,
    limits:limits
})

router.post("/upload",upload.single("fast_test"),(req,res)=>{

    if (!req.file) {
     return    res.json({
            no:"file not upload"
        })  }

                if (req.file) {
        return    res.json({
                yes:"file is upload"
            })
        }

        if (req.file===req.file) {
       return res.json({
        
        message:"file send api"
    })

        }
})

router.get("/filelist",(req,res)=>{
    const folder="naime"

    fs.readdir(folder,(err,files)=>{

        if (err) {
            return res.status(500).json({errr:"no file"})
            
        }

        const extion=['.png','.jpeg']

        const images=files
                    .filter(file=>extion.includes(path.extname(file).toLowerCase()))
                    .map(file=>({
                        nam:file,
                        usrl:`http://localhost:5000/list/${file}`
                    }))



                    res.json({images})
                    



    })
})




export default router;