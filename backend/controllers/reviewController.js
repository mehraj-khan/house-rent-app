import Review from '../models/Review.js';
import House from '../models/House.js';

// 1. نیا ریویو اور اسٹار شامل کرنا
export const addReview = async (req, res) => {
  try {
    const { houseId, userId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars!' });
    }

    // نیا ریویو بنائیں
    const review = await Review.create({
      house: houseId,
      user: userId,
      rating: Number(rating),
      comment,
    });

    // اس گھر کے تمام ریویوز نکال کر خودکار اوسط (Average) کا حساب کریں
    const allReviews = await Review.find({ house: houseId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await House.findByIdAndUpdate(houseId, {
      averageRating: Number(avg.toFixed(1)),
      totalReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json({ message: 'Review added successfully! ⭐', review: populatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. کسی گھر کے تمام ریویوز لانا
export const getHouseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ house: req.params.houseId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};