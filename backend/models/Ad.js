import mongoose from 'mongoose';

const adSchema = new mongoose.Schema(
  {
    // 'banner' = کوئی باہر کا بندہ/کمپنی ویب پر Ad لگائے | 'house_boost' = مالک اپنا گھر ٹاپ پر بوسٹ کرے
    adType: {
      type: String,
      enum: ['banner', 'house_boost'],
      default: 'banner',
    },
    house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    advertiserName: { type: String, required: true },
    advertiserPhone: { type: String, required: true },
    businessName: { type: String, default: '' },

    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    targetUrl: { type: String, default: '' },

    placement: {
      type: String,
      enum: ['home_top', 'in_feed', 'featured_house'],
      default: 'in_feed',
    },
    city: { type: String, default: 'all' },

    packageDays: { type: Number, enum: [7, 15, 30], default: 7 },
    price: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['JazzCash', 'EasyPaisa'], default: 'JazzCash' },
    transactionId: { type: String, required: true },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },

    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Ad = mongoose.model('Ad', adSchema);
export default Ad;