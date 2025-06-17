const mongoose = require('mongoose');

// Schéma Matière
const matiereSchema = new mongoose.Schema({
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
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour accéder aux cours de cette matière
matiereSchema.virtual('cours', {
  ref: 'Cours',
  localField: '_id',
  foreignField: 'idMatiere'
});

const Matiere = mongoose.model('Matiere', matiereSchema, 'matieres');

module.exports = Matiere;
