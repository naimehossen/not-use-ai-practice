import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  server: { type: String, required: true },
  username: { type: String },
  password: { type: String }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema,"hiiii");
export default User;