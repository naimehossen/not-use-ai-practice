import User from "../model/login.model.js";
import bcrypt from 'bcrypt'

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt); // ✅ Fixed
        
        // Create user
        const user = await User.reate({
            name: name,
            email: email,
            password: hashPassword
        });
        
        // Remove password from response
        const userWithoutPassword = {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
        
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: userWithoutPassword
        });
        
    } catch (error) {
        console.error("Register error: naime", error);
        res.status(500).json({ error: error.message});
    }
}

export const get = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // password বাদ দিয়ে
        res.json({ 
            success: true,
            count: users.length,
            users: users 
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: error.message });
    }
}