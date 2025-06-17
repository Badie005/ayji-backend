const mongoose = require('mongoose');

// Schéma pour les matières
const subjectSchema = new mongoose.Schema({
  nomMatiere: {
    type: String,
    required: [true, 'Le nom de la matière est requis'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Création du modèle
const Subject = mongoose.model('Subject', subjectSchema, 'matieres');

module.exports = Subject;