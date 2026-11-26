import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema(
  {
    // Rent یا Sale کی پہچان
    purpose: { type: String, enum: ['rent', 'sale'], default: 'rent' },
    propertyType: {
      type: String,
      enum: ['house', 'flat', 'plot', 'portion', 'commercial'],
      default: 'house',
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    // Rent کی قیمتیں
    pricePerDay: { type: Number, default: 0 },
    rentPrice: { type: Number, default: 0 },
    pricePerYear: { type: Number, default: 0 },
    availableFor: [{ type: String, enum: ['daily', 'monthly', 'yearly'] }],

    // Buy / Sell کی قیمتیں اور سائز
    salePrice: { type: Number, default: 0 },
    areaSize: { type: String, default: '' },
    areaUnit: {
      type: String,
      enum: ['Marla', 'Kanal', 'Sq. Ft', 'Sq. Yds'],
      default: 'Marla',
    },
    isNegotiable: { type: Boolean, default: true },
    possessionStatus: {
      type: String,
      enum: ['ready', 'under_construction', 'file'],
      default: 'ready',
    },
    installmentAvailable: { type: Boolean, default: false },

    suitableFor: { type: String, enum: ['family', 'bachelors', 'both'], default: 'both' },
    availableFrom: { type: Date, default: null },
    availableTo: { type: Date, default: null },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    videoUrl: { type: String, default: '' },

    city: { type: String, required: true },
    address: { type: String, required: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    isAvailable: { type: Boolean, default: true },

    // Shared / Roommate Fields
    isShared: { type: Boolean, default: false },
    totalBeds: { type: Number, default: 1 },
    pricePerPerson: { type: Number, default: 0 },
    sharedGender: { type: String, enum: ['boys', 'girls', 'any'], default: 'any' },

    // Utility Truth Badges
    utilities: {
      separateMeter: { type: Boolean, default: false },
      solarOrUps: { type: Boolean, default: false },
      suiGas: { type: Boolean, default: false },
      water24x7: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
    },
    nearLandmark: { type: String, default: '' },

    // 🚀 Smart Ranking & Featured Ad Boost
    isFeatured: { type: Boolean, default: false },
    featuredUntil: { type: Date, default: null },
    views: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0 },

  },
  { timestamps: true }
);
houseSchema.index({ purpose: 1, isFeatured: -1, qualityScore: -1, createdAt: -1 });
houseSchema.index({ city: 1, purpose: 1 });
houseSchema.index({ rentPrice: 1 });
houseSchema.index({ salePrice: 1 });


const House = mongoose.model('House', houseSchema);
export default House;