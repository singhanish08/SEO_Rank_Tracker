import express from 'express';
import rateLimit from 'express-rate-limit';
import { forgotPassword, getUser, login, register, resendVerification, resetPassword, verifyEmail } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const authRouter = express.Router();

// Rate limiter: 5 requests per hour per IP
const sensitiveLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many authentication attempts. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

authRouter.post('/register', loginLimiter, register);
authRouter.post('/login', loginLimiter, login);
authRouter.get('/user', auth, getUser);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/resend-verification', auth, sensitiveLimiter, resendVerification);
authRouter.post('/forgot-password', sensitiveLimiter, forgotPassword);
authRouter.post('/reset-password', resetPassword);

export default authRouter;
