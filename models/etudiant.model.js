const mongoose = require('mongoose');

// Schéma Etudiant
const etudiantSchema = new mongoose.Schema({
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: [true, 'ID utilisateur requis']
  },
  dateInscription: {
    type: Date,
    required: [true, 'Date d\'inscription requise'],
    default: Date.now
  },
  derniereConnexion: {
    type: Date,
    default: null
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour accéder aux informations de l'utilisateur
etudiantSchema.virtual('utilisateur', {
  ref: 'Utilisateur',
  localField: 'idUtilisateur',
  foreignField: '_id',
  justOne: true
});

// Virtual pour accéder aux progressions
etudiantSchema.virtual('progressions', {
  ref: 'Progression',
  localField: '_id',
  foreignField: 'idEtudiant'
});

// Virtual pour accéder aux tentatives de QCM
etudiantSchema.virtual('tentativesQCM', {
  ref: 'TentativeQCM',
  localField: '_id',
  foreignField: 'idEtudiant'
});

// Middleware pour inclure automatiquement l'utilisateur
etudiantSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'utilisateur',
    select: 'nom prenom email'
  });
  next();
});

// Méthode pour mettre à jour la dernière connexion
etudiantSchema.methods.updateDerniereConnexion = async function() {
  this.derniereConnexion = new Date();
  await this.save();
};

const Etudiant = mongoose.model('Etudiant', etudiantSchema, 'etudiants');

module.exports = Etudiant;
