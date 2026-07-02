import express from 'express'
import multer from 'multer';
import { alip, folderController } from '../controllers/uploadtest.controller.js';
import { getUploadUrl, profile } from '../controllers/profile.controller.js';

const router=express.Router();

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'naimeupload/')

    },

    filename:(req,file,cb)=>{
        const ext=file.originalname;

        const fakka="___";

        const image=Date.now()+fakka+ext;

        cb(null,image)
    }
})

const upload=multer({
    storage:storage
})


router.post("/api",upload.single("nam"),folderController);

router.get("/get",alip);

router.get("/profile",profile);

router.post('/get-upload-url', getUploadUrl);


export default router;