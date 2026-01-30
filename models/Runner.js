const mongoose = require('mongoose');

const RunnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nationalId: {
    type: String,
    required: true
  },
  nationalSlipImage: {
    name: String,
    path: String
  },
  photo: {
    name: String,
    path: String
  },
  vehicleType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  relativePhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Runner', RunnerSchema);
