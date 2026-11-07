import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    pricePerDay: { type: Number, default: 0 },
    rentPrice: { type: Number, required: true },
    pricePerYear: { type: Number, default: 0 },
    availableFor: [{ type: String, enum: ['daily', 'monthly', 'yearly'] }],
    suitableFor: { type: String, enum: ['family', 'bachelors', 'both'], default: 'both' },
    availableFrom: { type: Date, default: null },
    availableTo: { type: Date, default: null },

    // ⭐ لائیو ریٹنگ اور ریویوز کاؤنٹ
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    city: { type: String, required: true },
    address: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const House = mongoose.model('House', houseSchema);
export default House;