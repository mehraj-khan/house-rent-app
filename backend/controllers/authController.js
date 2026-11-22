import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/sendEmail.js';
import nodemailer from 'nodemailer';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Forgot Password OTP بھیجنا
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required!' });

    const escaped = email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ email: { $regex: `^${escaped}$`, $options: 'i' } });
    if (!user) return res.status(404).json({ message: 'No account found with this email!' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await User.findByIdAndUpdate(user._id, {
      resetOtp: otp,
      resetOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: 'Email credentials (EMAIL_USER / EMAIL_PASS) missing in environment variables.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"HouseRent PK" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔑 Password Reset Code - HouseRent PK',
      html: `<h3>Password Reset Request</h3><p>Your 6-digit reset code is:</p><h1 style="color:#2563eb;letter-spacing:4px;">${otp}</h1><p>This code expires in 10 minutes.</p>`,
    });

    res.status(200).json({ message: 'Reset code sent to your email!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. OTP تصدیق کر کے نیا پاس ورڈ سیٹ کرنا
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required!' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long!' });
    }

    const escaped = email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({
      email: { $regex: `^${escaped}$`, $options: 'i' },
      resetOtp: otp.trim(),
      resetOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code!' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpires: null,
    });

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. گوگل کے ذریعے 1-Click لاگ ان اور سائن اپ
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, sub: googleId } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(googleId + process.env.JWT_SECRET, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: '0300-0000000',
        role: 'tenant',
      });
    }

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

// 4. نیا یوزر رجسٹر کرنا
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

// 5. یوزر لاگ ان کرنا
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

// 6. ای میل پر 6 ہندسوں کا OTP بھیجنا
export const sendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required!' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered! Please login.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode });

    await sendOTPEmail(email, otpCode);

    res.status(200).json({ message: '6-digit verification code sent to your email!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. کوڈ چیک کرنا اور تصدیق کے بعد اکاؤنٹ بنانا
export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { name, phone, email, password, otp } = req.body;

    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid or expired verification code!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
    });

    await OTP.deleteMany({ email });

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

// 8. یوزر کی پروفائل اپڈیٹ کرنا
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