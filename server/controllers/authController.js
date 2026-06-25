import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService.js";

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"});
}

//Register User
export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({success: false, message: "All fields are required"});
        }
        // Check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({success: false, message: "User already exists"});
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        // Create user
        const user = await User.create({name, email, password: hashedPassword});

        // Generate verification token (SHA-256 hash stored, raw token sent via email)
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
        user.verificationToken = hashedToken;
        user.verificationExpires = Date.now() + 30 * 60 * 1000;
        await user.save();

        // Send verification email (fire-and-forget)
        sendVerificationEmail(user.email, user.name, verificationToken);

        const token = generateToken(user._id);

        res.status(201).json({success: true, token, user: {id: user._id, name: user.name, email: user.email, plan: user.plan, emailVerified: false}});

    } catch (error) {
        console.error("Register error:", error.message)
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

// Login user
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({success: false, message: "Email and password are required"});
        }
        // Find user
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "Invalid credentials"});
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success: false, message: "Invalid credentials"});
        }
        // Generate token
        const token = generateToken(user._id);
        res.status(200).json({success: true, token, user: {id: user._id, name: user.name, email: user.email, plan: user.plan, emailVerified: user.emailVerified}});

    } catch (error) {
        console.error("Login error:", error.message)
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

//Get current user
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password -verificationToken -verificationExpires -resetPasswordToken -resetPasswordExpires");
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }
        res.status(200).json({success: true, user});

    } catch (error) {
        console.error("Get current user error:", error.message)
        res.status(500).json({success: false, message: "Internal server error"});
    }
}

// Verify email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ success: false, message: "Verification token is required" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid verification token" });
        }

        if (user.emailVerified) {
            return res.json({ success: true, message: "Email already verified" });
        }

        if (user.verificationExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Verification token has expired" });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();

        res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.error("Verify email error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Resend verification email
export const resendVerification = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: "Email already verified" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

        user.verificationToken = hashedToken;
        user.verificationExpires = Date.now() + 30 * 60 * 1000;
        await user.save();

        sendVerificationEmail(user.email, user.name, verificationToken);

        res.json({ success: true, message: "Verification email sent" });
    } catch (error) {
        console.error("Resend verification error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email });
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ success: true, message: "If an account exists, a password reset email has been sent" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
        await user.save();

        sendPasswordResetEmail(user.email, user.name, resetToken);

        res.json({ success: true, message: "If an account exists, a password reset email has been sent" });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ success: false, message: "Token and password are required" });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain an uppercase letter" });
        }
        if (!/[a-z]/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain a lowercase letter" });
        }
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ success: false, message: "Password must contain a number" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};