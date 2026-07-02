import mongoose from "mongoose";



const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mydb");
    console.log("MongoDB Connected");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default connectDB;




