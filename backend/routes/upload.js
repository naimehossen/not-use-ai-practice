import express from 'express'
import path from 'path'
import multer from 'multer';
import fs from 'fs'
import { multipleUpload, uploadsingle } from '../controllers/upload.controller.js';

const router=express.Router();

const getfolder=(mimetipe)=>{
    if(mimetipe.startsWith('image/')) return 'uploads/images'
    if(mimetipe==='application/pdf') return 'application/pdf/upload'

    return 'uploads/others'
}

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
    const folder=getfolder(file.mimetype);
    if(!fs.existsSync(folder)) fs.mkdirSync(folder,{recursive:true});
    cb(null,folder)
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalname)
    }
});

const upload=multer({
    storage,
    limits:{fileSize : 5*1024*1024}
})


upload.fields

router.post("/single",upload.single('file'), uploadsingle)

router.post("/multiple",upload.array('files',5),multipleUpload)

// routes/upload.js তে যোগ করুন
router.get('/files', (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // চেক করুন ফোল্ডার আছে কিনা
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ 
        success: true, 
        files: [],
        message: 'কোন ফোল্ডার নেই' 
      });
    }
    
    const getAllFiles = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...getAllFiles(fullPath));
        } else {
          // URL তৈরি করা (সঠিকভাবে)
          let url = fullPath.replace(/\\/g, '/'); // Windows পাথে \ থেকে / করা
          url = url.replace(process.cwd(), ''); // ফুল পাথ থেকে current working directory বাদ দেওয়া
          
          files.push({
            name: item,
            size: stat.size,
            path: fullPath,
            url: url,
            type: path.extname(item)
          });
        }
      });
      return files;
    };
    
    const allFiles = getAllFiles(uploadsDir);
    res.json({ 
      success: true, 
      count: allFiles.length,
      files: allFiles 
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


export default router;
