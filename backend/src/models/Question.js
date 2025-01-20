import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    trim: true
  },
  articleLink: {
    type: String,
    trim: true,
    default: '#'
  },
  practiceLink: {
    type: String,
    trim: true,
    default: '#'
  },
  notes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  starredBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  solvedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    solvedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);
export default Question;