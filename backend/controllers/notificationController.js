import Notification from '../models/Notification.js';
import Message from '../models/Message.js';

// 1. یوزر کے تمام نوٹیفیکیشنز اور Unread گنتی لانا
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const [notifications, unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
      Notification.find({ user: userId }).sort({ updatedAt: -1 }).limit(15),
      Notification.countDocuments({ user: userId, isRead: false }),
      Message.countDocuments({ receiver: userId, isRead: false }),
    ]);

    res.status(200).json({
      notifications,
      unreadNotificationsCount,
      unreadMessagesCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. تمام نوٹیفیکیشنز کو Read مارک کرنا
export const markAllNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. کسی ایک نوٹیفیکیشن کو Read مارک کرنا
export const markOneNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};