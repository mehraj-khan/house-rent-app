import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/sendEmail.js';



const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 3. گوگل کے ذریعے 1-Click لاگ ان اور سائن اپ
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // گوگل سے یوزر کی تصدیق کریں
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId } = ticket.getPayload();

    // چیک کریں کہ کیا یہ یوزر پہلے سے موجود ہے؟
    let user = await User.findOne({ email });

    // اگر نیا یوزر ہے تو خودبخود اکاؤنٹ بنا دیں
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(googleId + process.env.JWT_SECRET, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: '0300-0000000',
        role: 'tenant', // ڈیفالٹ میں کرایہ دار
      });
    }

    // لاگ ان ٹوکن بنائیں
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Google login successful! 🎉',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};
// 1. نیا یوزر رجسٹر کرنا (ساتھ ہی آٹو لاگ ان ٹوکن)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Yeh email pehle se registered hai!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'tenant',
    });

    // نئے یوزر کے لیے لاگ ان ٹوکن بنائیں
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account kamyabi se ban gaya hai! 🎉',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. یوزر لاگ ان کرنا
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Galat Email ya Password!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Galat Email ya Password!' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login Kamyab raha! ✅',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 5. ای میل پر 6 ہندسوں کا OTP بھیجنا
export const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required!' });
    }

    // چیک کریں کہ کیا یہ ای میل پہلے سے رجسٹرڈ تو نہیں
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered! Please login.' });
    }

    // 6 ہندسوں کا رینڈم کوڈ بنائیں
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // پرانا OTP ڈیلیٹ کر کے نیا سیو کریں
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode });

    // اصلی جی میل پر کوڈ بھیجیں
    await sendOTPEmail(email, otpCode);

    res.status(200).json({ message: '6-digit verification code sent to your email!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. کوڈ چیک کرنا اور تصدیق کے بعد اکاؤنٹ بنانا
export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { name, phone, email, password, otp } = req.body;

    // ڈیٹا بیس سے کوڈ چیک کریں
    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid or expired verification code!' });
    }

    // پاسورڈ ہیش کریں
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // تصدیق شدہ اکاؤنٹ بنائیں
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
    });

    // استعمال شدہ OTP ڈیلیٹ کر دیں
    await OTP.deleteMany({ email });

    // ٹوکن جنریٹ کریں
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account verified & created successfully! 🎉',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. یوزر کی پروفائل اپڈیٹ کرنا (نام اور فون نمبر)
export const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    ).select('-password');



    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({
      message: 'Profile updated successfully! ✅',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 3. گھروں کے تمام کنٹرولرز (Add, Get, Delete)