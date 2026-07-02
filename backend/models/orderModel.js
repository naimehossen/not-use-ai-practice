import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // কে অর্ডার করল
    items: { type: Array, required: true },  // কোন কোন খাবার (আপনার সেই count অবজেক্টের ফিল্টার্ড ডাটা)
    amount: { type: Number, required: true }, // মোট কত টাকা
    address: { type: Object, required: true }, // ইউজারের ঠিকানা
    status: { type: String, default: "Food Processing" }, // অর্ডারের বর্তমান অবস্থা
    date: { type: Date, default: Date.now() }, // কখন অর্ডার করল
    payment: { type: Boolean, default: false } // টাকা দিয়েছে কি না (শুরুতে false থাকবে)
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;