import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['need_room', 'need_roommate'],
      default: 'need_room',
    },
    city: { type: String, required: true },
    area: { type: String, required: true },
    maxBudget: { type: Number, required: true },
    gender: {
      type: String,
      enum: ['boys', 'girls', 'family', 'any'],
      default: 'boys',
    },
    occupation: { type: String, default: '' },
    phone: { type: String, required: true },
    moveInDate: { type: Date, default: null },
    images: [{ type: String }], // 👈 نیا: آپشنل تصاویر
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;