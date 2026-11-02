import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import authRoutes from './routes/authRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

// 1. DNS صرف لوکل کمپیوٹر پر چلے، Vercel کلاؤڈ میں بلاک نہ کرے
if (!process.env.VERCEL) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// 2. کلاؤڈ کے لیے محفوظ ڈیٹا بیس کنکشن مڈل ویئر
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Database kamyabi se connect ho gaya hai! ✅');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
};

// ہر ریکوئسٹ آنے پر پہلے ڈیٹا بیس جڑنے کا انتظار کرے تاکہ 10000ms ٹائم آؤٹ نہ آئے
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// تمام روٹس
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('House Rent Web App Server is Running Successfully! 🏠');
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server chal raha hai: http://localhost:${PORT}`);
  });
}

export default app;