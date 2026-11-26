import express from 'express';
import {
  registerUser,
  loginUser,
  googleLogin,
  updateProfile,
  sendVerificationOTP,
  verifyOTPAndRegister,
  sendResetOtp,
  resetPassword,
} from '../controllers/authController.js';
import { protect, rateLimiter } from '../middleware/authMiddleware.js';

const router = express.Router();

// لاگ ان اور رجسٹریشن پر زیادہ سے زیادہ 20 کوششیں (15 منٹ میں)
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login/register attempts. Please wait 15 minutes.',
});

// OTP ای میل اسپام روکنے کے لیے (15 منٹ میں زیادہ سے زیادہ 6 بار)
const otpLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: 'Too many OTP requests. Please try again after 15 minutes.',
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/google', authLimiter, googleLogin);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', otpLimiter, sendResetOtp);
router.post('/reset-password', authLimiter, resetPassword);

// ای میل تصدیق کے راستے
router.post('/send-otp', otpLimiter, sendVerificationOTP);
router.post('/verify-otp', authLimiter, verifyOTPAndRegister);

export default router;