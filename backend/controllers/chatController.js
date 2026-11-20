import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// 1. نیا میسج بھیجنا + نوٹیفیکیشن بنانا
export const sendMessage = async (req, res) => {
  try {
    const { houseId, requirementId, senderId, receiverId, text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text cannot be empty!' });
    }

    const message = await Message.create({
      house: houseId || null,
      requirement: requirementId || null,
      sender: senderId,
      receiver: receiverId,
      text,
      isRead: false,
    });

    // 🔔 ریسیور کے لیے نوٹیفیکیشن بنائیں (اسپام سے بچنے کے لیے ایک ہی ان ریڈ نوٹیفیکیشن اپڈیٹ کریں)
    try {
      const senderUser = await User.findById(senderId).select('name');
      const senderName = senderUser?.name || 'Someone';
      const shortText = text.length > 45 ? text.slice(0, 45) + '...' : text;

      const existingNotif = await Notification.findOne({
        user: receiverId,
        sender: senderId,
        type: 'message',
        isRead: false,
      });

      if (existingNotif) {
        existingNotif.message = `${senderName}: "${shortText}"`;
        await existingNotif.save();
      } else {
        await Notification.create({
          user: receiverId,
          sender: senderId,
          title: `💬 New Message from ${senderName}`,
          message: shortText,
          type: 'message',
          link: '/messages',
          isRead: false,
        });
      }
    } catch {
      // نوٹیفیکیشن ایرر میسج کو نہ روکے
    }

    res.status(201).json({ message: 'Message sent!', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. دو یوزرز کے درمیان چیٹ لانا + خودکار Read مارک کرنا
export const getMessages = async (req, res) => {
  try {
    const { houseId, user1, user2 } = req.params;

    // user1 (لاگ ان یوزر) جب چیٹ کھولے تو user2 کے بھیجے گئے میسجز Read ہو جائیں
    await Message.updateMany(
      {
        $or: [{ house: houseId }, { requirement: houseId }],
        sender: user2,
        receiver: user1,
        isRead: false,
      },
      { isRead: true }
    );

    const messages = await Message.find({
      $and: [
        { $or: [{ house: houseId }, { requirement: houseId }] },
        {
          $or: [
            { sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 },
          ],
        },
      ],
    })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. تمام ایکٹیو چیٹس لانا (Messages Inbox)
export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('house', 'title city rentPrice images')
      .populate('requirement', 'title city area maxBudget')
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};