import User from '../models/User.js';
import House from '../models/House.js';
import Booking from '../models/Booking.js';
import Ad from '../models/Ad.js';
import Notification from '../models/Notification.js';

// 4. مالک یا ایجنسی کو Verified Badge دینا / ہٹانا
export const toggleVerifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found!' });

    user.isVerified = !user.isVerified;
    await user.save();

    if (user.isVerified) {
      try {
        await Notification.create({
          user: user._id,
          title: '✅ Account Verified!',
          message: 'Congratulations! Your profile & properties now show the Verified Owner badge.',
          type: 'system',
          link: '/dashboard',
          isRead: false,
        });
      } catch {
        // ignore notification error
      }
    }

    res.status(200).json({
      message: user.isVerified ? 'User Verified! ✅' : 'Verification removed.',
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 1. پلیٹ فارم کے مجموعی اینالیٹکس (Stats + Ads Earnings)
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalHouses,
      totalBookings,
      completedDeals,
      approvedAds,
      pendingAds,
      pendingBookings,
    ] = await Promise.all([
      User.countDocuments(),
      House.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ status: { $in: ['tenant_approved', 'landlord_paid'] } }),
      Ad.find({ status: 'approved' }),
      Ad.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'pending_admin' }),
    ]);

    const bookingEarnings = completedDeals.reduce(
      (sum, b) => sum + (Number(b.platformFee) || 500),
      0
    );
    const adEarnings = approvedAds.reduce(
      (sum, ad) => sum + (Number(ad.price) || 0),
      0
    );

    const now = new Date();
    const activeAds = approvedAds.filter(
      (a) => a.expiresAt && new Date(a.expiresAt) > now
    ).length;

    res.status(200).json({
      totalUsers,
      totalHouses,
      totalBookings,
      pendingBookings,
      pendingAds,
      activeAds,
      bookingEarnings,
      adEarnings,
      totalEarnings: bookingEarnings + adEarnings,
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
    await House.deleteMany({ owner: req.params.id });
    res.status(200).json({ message: 'User and their properties removed successfully! 🗑️' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};