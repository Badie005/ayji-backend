const mongoose = require('mongoose');

// Schéma QCM
const qcmSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du QCM est requis'],
    trim: true
  },
  dateCreation: {
    type: Date,
    required: [true, 'La date de création est requise'],
    default: Date.now
  },
  tempsLimite: {
    type: Number,
    comment: 'Temps limite en minutes'
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

// Virtuals pour accéder aux questions et tentatives liées
qcmSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'idQCM'
});

qcmSchema.virtual('tentatives', {
  ref: 'TentativeQCM',
  localField: '_id',
  foreignField: 'idQCM'
});

// Populate automatique des références
qcmSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'idCours',
    select: 'titre'
  });
  next();
});

// Méthode statique pour trouver des QCMs par cours
qcmSchema.statics.findByCours = function(coursId) {
  return this.find({ idCours: coursId });
};

const QCM = mongoose.model('QCM', qcmSchema, 'qcms');

module.exports = QCM;
