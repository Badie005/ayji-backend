const mongoose = require('mongoose');

// Schéma pour les exercices
const exerciseSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre de l\'exercice est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  difficulte: {
    type: String,
    enum: ['Facile', 'Moyen', 'Difficile'],
    default: 'Moyen'
  },
  dateCreation: {
    type: Date,
    default: Date.now
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
  contenu: {
    type: String,
    required: [true, 'Le contenu de l\'exercice est requis']
  },
  solution: {
    type: String
  },
  indice: {
    type: String
  }
}, {
  timestamps: true
});

// Création du modèle
const Exercise = mongoose.model('Exercise', exerciseSchema, 'exercices');

module.exports = Exercise;