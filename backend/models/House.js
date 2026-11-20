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
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    videoUrl: { type: String, default: '' },

    city: { type: String, required: true },
    address: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    isAvailable: { type: Boolean, default: true },

    // 🎓 Shared / Roommate Fields
    isShared: { type: Boolean, default: false },
    totalBeds: { type: Number, default: 1 },
    pricePerPerson: { type: Number, default: 0 },
    sharedGender: { type: String, enum: ['boys', 'girls', 'any'], default: 'any' },

    // ⚡ نیا: پاکستان یوٹیلیٹی سچائی کارڈ (Utility Truth Badges)
    utilities: {
      separateMeter: { type: Boolean, default: false },
      solarOrUps: { type: Boolean, default: false },
      suiGas: { type: Boolean, default: false },
      water24x7: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
    },
    nearLandmark: { type: String, default: '' },
  },
  { timestamps: true }
);

const House = mongoose.model('House', houseSchema);
export default House;