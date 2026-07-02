import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} } // এখানে ইউজারের কার্টের সেই জটিল {id: count} অবজেক্টটি সেভ হবে
}, { minimize: false }); // minimize false না দিলে খালি অবজেক্ট সেভ হয় না

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;