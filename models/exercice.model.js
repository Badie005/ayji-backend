const mongoose = require('mongoose');

// Schéma Exercice
const exerciceSchema = new mongoose.Schema({
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
    required: [true, 'La difficulté est requise']
  },
  dateCreation: {
    type: Date,
    required: [true, 'La date de création est requise'],
    default: Date.now
  },
  idCours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: [true, 'L\'ID du cours est requis']
  },
  idAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'L\'ID de l\'administrateur est requis']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour la recherche
exerciceSchema.index({ titre: 'text', description: 'text' });

// Populate automatique des références
exerciceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'idCours',
    select: 'titre'
  });
  next();
});

const Exercice = mongoose.model('Exercice', exerciceSchema, 'exercices');

module.exports = Exercice;
