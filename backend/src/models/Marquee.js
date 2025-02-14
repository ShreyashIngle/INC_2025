import mongoose from 'mongoose';

const marqueeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Marquee = mongoose.model('Marquee', marqueeSchema);
export default Marquee;