import Message from '../models/Message.js';

// 1. نیا میسج بھیجنا (House یا Roommate Requirement دونوں کے لیے)
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
    });

    res.status(201).json({ message: 'Message sent!', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. دو یوزرز کے درمیان ہونے والی چیٹ لانا (House یا Requirement کے لیے)
export const getMessages = async (req, res) => {
  try {
    const { houseId, user1, user2 } = req.params;

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

// 3. کسی یوزر کی تمام ایکٹیو چیٹس لانا (Dashboard / Messages Inbox)
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