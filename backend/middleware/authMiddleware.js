import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. تمام لاگ ان یوزرز کے لیے (Tenant, Landlord, Buyer, Admin)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized! Please log in first.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'Invalid token! Please log in again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User account not found!' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired! Please log in again.' });
  }
};

// 2. صرف Admin کے لیے
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: '403 Forbidden! You are not an Admin.' });
};

// 3. آپ کا پرانا verifyAdmin (مکمل محفوظ)
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided! Access denied.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: '403 Forbidden! You are not an Admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token! Access denied.' });
  }
};

// 4. Rate Limiter (اسپام اور بوٹس روکنے کے لیے)
const rateStore = new Map();
export const rateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 30,
  message = 'Too many requests, please try again later.',
} = {}) => {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const key = `${req.baseUrl}${req.path}_${ip}`;
    const now = Date.now();

    if (rateStore.size > 5000) rateStore.clear();

    const record = rateStore.get(key);
    if (!record || record.resetAt < now) {
      rateStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({ message });
    }

    record.count += 1;
    next();
  };
};