import OSS from "ali-oss";

import dotenv from "dotenv";
dotenv.config();

export const ossClient = new OSS({
    region: process.env.ALIYUN_REGION,
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    bucket: process.env.ALIYUN_BUCKET
})
