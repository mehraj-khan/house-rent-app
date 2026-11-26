import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rentType: { type: String, enum: ['daily', 'monthly', 'yearly', 'sale'], default: 'monthly' },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    durationCount: { type: Number, default: 1 },
    originalRent: { type: Number, required: true },
    offeredRent: { type: Number, required: true },
    counterRent: { type: Number, default: 0 },
    finalAgreedRent: { type: Number, default: 0 },
    lastActionBy: { type: String, enum: ['tenant', 'landlord'], default: 'tenant' },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'countered', 'accepted', 'rejected', 'booked'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;