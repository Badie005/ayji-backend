const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseNumber: {
    type: Number,
    unique: true,
    sparse: true  // Permet des valeurs nulles
  },
  title: {
    type: String,
    required: [true, 'Le titre du cours est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description du cours est requise'],
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'La matière associée est requise']
  },
  content: {
    type: String,
    default: ''
  },
  coursePdfUrl: {
    type: String,
    default: ''
  },
  exercisePdfUrl: {
    type: String,
    default: ''
  },
  qcmPdfUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;