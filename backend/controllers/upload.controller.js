



export const uploadsingle=(req,res)=>{

//const {file}=req.body;

try {

    if (!req.file) {
        return res.status(400).json({error:"no file single "})
    }
    

    
    res.json({
        success:true,
        file:{
            name:req.file.filename,
            size:req.file.size,
            path:req.file.path,
            
        }
    })
} catch (error) {
    res.status(400).json({error})
}


}


export const multipleUpload=(req,res)=>{

        //const {files}=req.body;

    try {
    
        if (!req.files||req.files.length===0) {
            return res.status(400).json({error:"no file"})
        }

        const files=req.files.map(f=>({
            name:f.filename,
            size:f.size
        }))

        res.json({
            success:true,
            total:files.length,
            files:files
        })
    } catch (error) {
        res.status(400).json({error})
    }

}