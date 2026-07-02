import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import uploadroute from "./routes/upload.js"
import uploadtestRoute from "./routes/upload.route.js"
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// Middleware - এটি রিঅ্যাক্ট থেকে আসা ডাটা রিসিভ করতে সাহায্য করে
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/list',express.static('naime'))
app.use('/useuplaoad',express.static('naimeupload'))




// Connect DB
connectDB();

// Routes
app.use("/api/vpn", userRoutes); // রুট নাম একটু মিনিংফুল করলাম
app.use("/api/upload",uploadroute);
app.use("/upload",uploadtestRoute)

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend logic running on port ${PORT}`));