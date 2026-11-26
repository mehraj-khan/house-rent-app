import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['tenant', 'landlord', 'admin' , 'user'], // 👈 admin رول شامل کیا
      default: 'tenant',
    },
    resetOtp: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },

  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;