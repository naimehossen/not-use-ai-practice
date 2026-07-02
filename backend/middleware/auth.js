import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers; // ফ্রন্টএন্ড থেকে হেডার হিসেবে টোকেন আসবে

    if (!token) {
        return res.json({ success: false, message: "লগইন করুন, তারপর চেষ্টা করুন!" });
    }

    try {
        // টোকেনটি ডিকোড করে আসল আইডি বের করা
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id; // আইডিতে বডিতে পুশ করে দেওয়া
        next(); // এবার কন্ট্রোলারে যাওয়ার অনুমতি দেওয়া হলো
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "টোকেন সঠিক নয়!" });
    }
};

export default authMiddleware;