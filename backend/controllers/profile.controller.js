import uploadModel from "../models/upload.model.js";

//import { ossClient } from '../config/oss.config.js';






export const profile=async(req,res)=>{
  try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // ১. Input Sanitization
        const rawSearch = req.query.search || '';
        const trimmedSearch = rawSearch.trim();
        
        if (trimmedSearch.length > 100) {
            return res.status(400).json({ error: 'Search query too long' });
        }

        const filter = {};
        if (trimmedSearch) {
            // ২. Escaping Special Characters
            const safeSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.name = { $regex: safeSearch, $options: 'i' };
        }

        // ৩. Database Query with Lean and Count
        const [one, total] = await Promise.all([
            uploadModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            uploadModel.countDocuments(filter)
        ]);

        // ৪. Response
        res.json({
            success: true,
            data: one,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });

    } catch (error) {
        // ৫. Error Handling
        console.error(`[PROFILE ERROR]:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Could not fetch search results' 
        });
    }
}



import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// MinIO Client
const minioClient = new S3Client({
    region: process.env.MINIO_REGION || 'us-east-1',
    endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY
    },
    forcePathStyle: true 
});

export const getUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body; // fileType অ্যাড করা ভালো
        const key = `uploads/${Date.now()}-${fileName}`;
        const bucketName = process.env.MINIO_BUCKET || 'naime-uploads';

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: fileType // এটি দিলে আপলোড করা ফাইল ব্রাউজারে ঠিকঠাক ওপেন হবে
        });
        
        // ✅ আপডেট: method: 'PUT' যোগ করা হয়েছে এবং সময় বাড়ানো হয়েছে
        const uploadUrl = await getSignedUrl(minioClient, command, {
            expiresIn: 3600, // ১ ঘণ্টা সময় দেওয়া হলো যাতে তাড়াহুড়ো না হয়
            method: 'PUT'    // এটি ছাড়া Signature Error আসতে পারে
        });
        
        const cdnUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${key}`;
        
        res.json({ 
            success: true, 
            uploadUrl,   
            cdnUrl,      
            key 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};