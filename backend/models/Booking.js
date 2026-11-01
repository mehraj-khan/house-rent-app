import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    house: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rentType: { type: String, enum: ['daily', 'monthly', 'yearly'], required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    durationCount: { type: Number, required: true }, // کتنے دن یا کتنے ماہ
    totalAmount: { type: Number, required: true }, // کل کرایہ
    platformFee: { type: Number, required: true }, // آپ کا منافع
    landlordAmount: { type: Number, required: true }, // مالک کا حصہ
    paymentMethod: { type: String, enum: ['JazzCash', 'EasyPaisa'], required: true },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending_admin', 'holding_escrow', 'tenant_approved', 'landlord_paid', 'refunded'],
      default: 'pending_admin',
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;