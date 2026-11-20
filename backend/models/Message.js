import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House',
      required: false,
      default: null,
    },
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: false,
      default: null,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;