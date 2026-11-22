import express from 'express';
import { 
  registerUser, loginUser, googleLogin, updateProfile, 
  sendVerificationOTP, verifyOTPAndRegister 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.put('/profile', updateProfile);

// 📩 ای میل تصدیق کے راستے
router.post('/send-otp', sendVerificationOTP);
router.post('/verify-otp', verifyOTPAndRegister);

export default router;