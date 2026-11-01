import User from '../models/User.js';
import House from '../models/House.js';
import Booking from '../models/Booking.js';

// 1. پلیٹ فارم کے مجموعی اینالیٹکس (Stats)
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHouses = await House.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // آپ کی کمائی (تمام کامیاب ڈیلز پر 500 روپے کمیشن)
    const completedDeals = await Booking.find({
      status: { $in: ['tenant_approved', 'landlord_paid'] }
    });
    const totalEarnings = completedDeals.length * 500;

    res.status(200).json({
      totalUsers,
      totalHouses,
      totalBookings,
      totalEarnings,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. تمام یوزرز کی لسٹ لانا
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. کسی فراڈی یوزر کو مستقل ڈیلیٹ کرنا
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    // اس یوزر کے تمام مکانات بھی ڈیلیٹ کر دیں
    await House.deleteMany({ owner: req.params.id });
    res.status(200).json({ message: 'User and their properties removed successfully! 🗑️' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};