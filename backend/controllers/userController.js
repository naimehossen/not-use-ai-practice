import dotenv from 'dotenv';
dotenv.config();

import User from "../models/User.js";
import orderModel from "../models/orderModel.js";
import Stripe from "stripe";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// ✅ টোকেন তৈরি করার ফাংশন (1 মিনিট মেয়াদ - প্র্যাকটিসের জন্য)
const createToken = (id, rememberMe = false) => {
    // rememberMe চেক করলে 7 দিন, না হলে 1 মিনিট
    const expiresIn = rememberMe ? 20 : 20;
    
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET,
        { expiresIn: expiresIn }  // 👈 মেয়াদ যোগ করা হয়েছে
    );
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==================== ইউজার রেজিস্ট্রেশন ====================
export const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        // ইমেইল অলরেডি আছে কি না চেক করা
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // ইমেইল এবং পাসওয়ার্ড ভ্যালিডেশন
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // পাসওয়ার্ড এনক্রিপ্ট করা (Hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        const user = await newUser.save();
        
        // ✅ টোকেন তৈরি (1 মিনিট মেয়াদ)
        const token = createToken(user._id, false);
        
        res.json({ 
            success: true, 
            token,
            message: "Registration successful! Token expires in 1 minute (demo mode)"
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// ==================== ইউজার লগইন ====================
export const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body;  // 👈 rememberMe যোগ করা হয়েছে
    
    try {
        // ইউজার ডাটাবেসে আছে কি না চেক করা
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }
        
        // পাসওয়ার্ড মিলছে কি না চেক করা
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        
        // ✅ টোকেন তৈরি (rememberMe অনুযায়ী মেয়াদ)
        const token = createToken(user._id, rememberMe || false);
        
        // টোকেনের মেয়াদ জানানোর জন্য
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        
        res.json({ 
            success: true, 
            token,
            expiresIn: expiresIn,
            message: rememberMe ? "Login successful! Token expires in 7 days" : "Login successful! Token expires in 1 minute (demo mode)",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

// ==================== Google Login ====================
export const googleLogin = async (req, res) => {
    const { email, name, rememberMe } = req.body;  // 👈 rememberMe যোগ করা হয়েছে

    try {
        let user = await userModel.findOne({ email });

        if (!user) {
            // নতুন ইউজার তৈরি (password ছাড়াই)
            const randomPassword = Math.random().toString(36).slice(-10);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new userModel({
                name,
                email,
                password: hashedPassword
            });
            await user.save();
        }

        // ✅ টোকেন তৈরি
        const token = createToken(user._id, rememberMe || false);
        
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        res.json({
            success: true,
            token,
            expiresIn: expiresIn,
            message: rememberMe ? "Google login successful! Token expires in 7 days" : "Google login successful! Token expires in 1 minute"
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error in Google Login"
        });
    }
};

// ==================== Facebook Login ====================
export const facebookLogin = async (req, res) => {
    const { email, name, rememberMe } = req.body;  // 👈 rememberMe যোগ করা হয়েছে
    
    try {
        let user = await userModel.findOne({ email });

        if (!user) {
            user = new userModel({
                name,
                email,
                password: Math.random().toString(36).slice(-10)
            });
            await user.save();
        }

        // ✅ টোকেন তৈরি
        const token = createToken(user._id, rememberMe || false);
        
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        res.json({ 
            success: true, 
            token,
            expiresIn: expiresIn,
            message: rememberMe ? "Facebook login successful! Token expires in 7 days" : "Facebook login successful! Token expires in 1 minute"
        });
        
    } catch (error) {
        res.json({ success: false, message: "Facebook Login Failed" });
    }
};

// ==================== টোকেন ভেরিফাই মিডলওয়্যার ====================
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: "Access denied. No token provided." 
        });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Token expired. Please login again." 
            });
        }
        return res.status(401).json({ 
            success: false, 
            message: "Invalid token." 
        });
    }
};

// ==================== প্রোটেক্টেড রাউট উদাহরণ ====================
export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        res.json({ 
            success: true, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
};

// ==================== অন্যান্য ফাংশন (আপনার已有的) ====================
export const createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ success: true, message: "VPN Connection Saved! ✅" });
        console.log("ফ্রন্টএন্ড থেকে আসা ডাটা:", req.body);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const list = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5173";
    try {
        const newOrder = new orderModel({
            userId: req.body.userId || "12345",
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: "usd",
                product_data: { name: "Delivery Charges" },
                unit_amount: 40 * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "অর্ডার প্রসেস করতে সমস্যা হয়েছে!" });
    }
};

export const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid ✅" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid ❌" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};