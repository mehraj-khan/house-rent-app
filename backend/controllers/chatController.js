import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import House from '../models/House.js';
import Requirement from '../models/Requirement.js';
import { sendNewMessageEmail } from '../utils/sendEmail.js';

// 1. نیا میسج بھیجنا + بیل نوٹیفیکیشن + ڈائریکٹ ای میل الرٹ
export const sendMessage = async (req, res) => {
  try {
    const { houseId, requirementId, senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender and receiver are required!' });
    }

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text cannot be empty!' });
    }

    const cleanText = text.trim();

    const message = await Message.create({
      house: houseId || null,
      requirement: requirementId || null,
      sender: senderId,
      receiver: receiverId,
      text: cleanText,
      isRead: false,
    });

    try {
      const [senderUser, receiverUser, existingNotif] = await Promise.all([
        User.findById(senderId).select('name'),
        User.findById(receiverId).select('name email'),
        Notification.findOne({
          user: receiverId,
          sender: senderId,
          type: 'message',
          isRead: false,
        }),
      ]);

      const senderName = senderUser?.name || 'Someone';
      const shortText = cleanText.length > 45 ? cleanText.slice(0, 45) + '...' : cleanText;

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

        // صرف پہلی ان ریڈ میسج پر ای میل بھیجیں (تاکہ اسپام نہ ہو)
        if (receiverUser?.email) {
          let contextTitle = 'HouseRent PK';
          if (houseId && mongoose.Types.ObjectId.isValid(houseId)) {
            const h = await House.findById(houseId).select('title');
            if (h?.title) contextTitle = h.title;
          } else if (requirementId && mongoose.Types.ObjectId.isValid(requirementId)) {
            const r = await Requirement.findById(requirementId).select('title');
            if (r?.title) contextTitle = r.title;
          }

          await sendNewMessageEmail({
            toEmail: receiverUser.email,
            toName: receiverUser.name,
            senderName,
            text: cleanText,
            contextTitle,
          });
        }
      }
    } catch (notifErr) {
      console.error('Notification/Email error:', notifErr.message);
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

    if (
      !mongoose.Types.ObjectId.isValid(user1) ||
      !mongoose.Types.ObjectId.isValid(user2)
    ) {
      return res.status(400).json({ message: 'Invalid user IDs' });
    }

    const contextFilter = mongoose.Types.ObjectId.isValid(houseId)
      ? { $or: [{ house: houseId }, { requirement: houseId }] }
      : { house: null, requirement: null };

    await Promise.all([
      Message.updateMany(
        {
          ...contextFilter,
          sender: user2,
          receiver: user1,
          isRead: false,
        },
        { isRead: true }
      ),
      Notification.updateMany(
        {
          user: user1,
          sender: user2,
          type: 'message',
          isRead: false,
        },
        { isRead: true }
      ),
    ]);

    const messages = await Message.find({
      $and: [
        contextFilter,
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

// 3. تمام ایکٹیو چیٹس لانا
export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

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