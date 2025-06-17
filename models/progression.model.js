const mongoose = require('mongoose');

// Modèle de progression alternatif (renommé pour éviter les conflits)
const userProgressionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure unique user-course combinations
userProgressionSchema.index({ user: 1, course: 1 }, { unique: true });

const UserProgressionLegacy = mongoose.model('UserProgressionLegacy', userProgressionSchema);

module.exports = UserProgressionLegacy;