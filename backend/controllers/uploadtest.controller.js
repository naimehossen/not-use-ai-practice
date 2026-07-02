import uploadModel from "../models/upload.model.js"
import modelprice from "../models/pricemodel.js"



export const folderController=async(req,res)=>{

    if (!req.file) {
        return res.json({sorry:"no file"})
    }

    const modeldata=await uploadModel.create({
        name:req.file.originalname,
        size:req.file.size,
        extname:req.file.mimetype,
        url:`http://localhost:5000/useuplaoad/${req.file.filename}`




    })

    const data=await uploadModel.find()

    



   res.json({
    message:"upload",
    data:data,
    
   })


}


 
export const alip= async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        // ✅ Search Query
        const search = req.query.search || '';
        
        // ✅ Filter Object
        const filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // case-insensitive
        }
        
        const total = await uploadModel.countDocuments(filter);
        const alldata = await uploadModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);



const bbbb = await uploadModel.aggregate([
    {$limit: limit},
    {$skip: skip},
    {$project: {
        name: 1,
        _id: 0,
        result: {
            $cond: {
                if: {
                    $in: ["$extname", ["image/png", "image/jpeg", "image/jpg", "image/gif"]]
                },
                then: "Image",
                else: "Not Image"
            }
        }
    }},
    {$lookup:{
        from:"masud_one",
        localField:"name",
        foreignField:"name",
        as:"twofile"

        
    }}
]);
        
        res.json({
            success: true,
            data: alldata,
            bbbb:bbbb,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}