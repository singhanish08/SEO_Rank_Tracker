import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, trim: true},
    password: {type: String, required: true},
    plan: {type: String, enum: ["free", "pro"], default: "free"},
    analysisCount: {type: Number, default: 0},
    lastAnalysisDate: {type: Date, default: null},
    emailVerified: {type: Boolean, default: false},
    verificationToken: {type: String},
    verificationExpires: {type: Date},
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date},
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;