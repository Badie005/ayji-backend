const mongoose = require('mongoose');

// Schéma pour les QCM
const quizSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du QCM est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  tempsLimite: {
    type: Number, // en minutes
    default: 30
  },
  idCours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'L\'ID du cours est requis']
  },
  idAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID de l\'administrateur est requis']
  },
  estPublie: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Création du modèle
const Quiz = mongoose.model('Quiz', quizSchema, 'qcms');

module.exports = Quiz;