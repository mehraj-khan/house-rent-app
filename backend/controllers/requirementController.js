import Requirement from '../models/Requirement.js';

// 1. نئی ریکوائرمنٹ پوسٹ کرنا
export const createRequirement = async (req, res) => {
  try {
    const {
      user, title, type, city, area,
      maxBudget, gender, occupation, phone, moveInDate, description, images
    } = req.body;

    if (!user || !title || !city || !area || !maxBudget || !phone || !description) {
      return res.status(400).json({ message: 'Please fill all required fields!' });
    }

    const postType = type || 'need_room';

    const newReq = await Requirement.create({
      user,
      title,
      type: postType,
      city,
      area,
      maxBudget: Number(maxBudget),
      gender: gender || 'boys',
      occupation: occupation || '',
      phone,
      moveInDate: moveInDate ? new Date(moveInDate) : null,
      images: postType === 'need_roommate' && Array.isArray(images) ? images : [],
      description,
    });

    const populated = await newReq.populate('user', 'name email');
    res.status(201).json({ message: 'Post published successfully! 🎉', requirement: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. تمام پوسٹس لانا
export const getAllRequirements = async (req, res) => {
  try {
    const { search, type, gender } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { city: { $regex: search.trim(), $options: 'i' } },
        { area: { $regex: search.trim(), $options: 'i' } },
        { title: { $regex: search.trim(), $options: 'i' } },
        { occupation: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (type && type !== 'all') query.type = type;
    if (gender && gender !== 'all') query.gender = gender;

    const requirements = await Requirement.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(requirements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 3. پوسٹ ڈیلیٹ کرنا
export const deleteRequirement = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const item = await Requirement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Post not found!' });

    if (role !== 'admin' && String(item.user) !== String(userId)) {
      return res.status(403).json({ message: 'You can only delete your own post!' });
    }

    await Requirement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted! 🗑️' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};