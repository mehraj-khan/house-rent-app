import express from 'express';
import { registerUser, loginUser, googleLogin } from '../controllers/authController.js';

const router = express.Router();

// 1. نیا اکاؤنٹ بنانا
router.post('/register', registerUser);

// 2. عام ای میل اور پاسورڈ سے لاگ ان
router.post('/login', loginUser);

// 3. گوگل 1-Click لاگ ان
router.post('/google', googleLogin);

export default router;