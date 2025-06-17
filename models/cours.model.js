const mongoose = require('mongoose');

// Schéma Cours
const coursSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du cours est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  cheminFichier: {
    type: String,
    trim: true
  },
  dateCreation: {
    type: Date,
    required: [true, 'La date de création est requise'],
    default: Date.now
  },
  dateModification: {
    type: Date,
    required: [true, 'La date de modification est requise'],
    default: Date.now
  },
  idMatiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matiere',
    required: [true, 'L\'ID de la matière est requis']
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
coursSchema.index({ titre: 'text', description: 'text' });

// Virtuals pour accéder aux exercices, QCMs et progressions liés
coursSchema.virtual('exercices', {
  ref: 'Exercice',
  localField: '_id',
  foreignField: 'idCours'
});

coursSchema.virtual('qcms', {
  ref: 'QCM',
  localField: '_id',
  foreignField: 'idCours'
});

coursSchema.virtual('progressions', {
  ref: 'Progression',
  localField: '_id',
  foreignField: 'idCours'
});

// Populate automatique des références
coursSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'idMatiere',
    select: 'nomMatiere'
  });
  next();
});

// Middleware pour mettre à jour la date de modification
coursSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.dateModification = Date.now();
  }
  next();
});

// Méthode statique pour trouver des cours par matière
coursSchema.statics.findByMatiere = function(matiereId) {
  return this.find({ idMatiere: matiereId });
};

const Cours = mongoose.model('Cours', coursSchema, 'cours');

module.exports = Cours;
