import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mydb = async () => {
    try {
           await mongoose.connect(process.env.MONGO_URL);
           console.log("db is connested");
           
           
           
        
        mongoose.connection.on("connected", () => {
            console.log("✅ db is connected");
            console.log(`📁 Database: ${mongoose.connection.name}`);
        })
        
        // অতিরিক্ত event handlers (optional)
        mongoose.connection.on("error", (err) => {
            console.log("⚠️ DB error:", err.message);
        });
        
    } catch (error) {
        console.log("❌ db not connected:", error.message);
        process.exit(1);
    }
}

export default mydb;