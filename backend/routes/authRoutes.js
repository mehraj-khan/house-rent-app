import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// رجسٹریشن کا راستہ: POST /api/auth/register
router.post('/register', registerUser);

// لاگ ان کا راستہ: POST /api/auth/login
router.post('/login', loginUser);

export default router;