import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  month: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  jobDescription: {
    type: String,
    trim: true
  },
  eligibilityCriteria: {
    cgpa: {
      type: Number,
      required: true
    },
    backlog: {
      type: Number,
      default: 0
    },
    branches: [{
      type: String,
      required: true
    }]
  },
  ctc: {
    type: Number,
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company;