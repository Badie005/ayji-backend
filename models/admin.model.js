const mongoose = require('mongoose');

// Schéma Admin
const adminSchema = new mongoose.Schema({
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: [true, 'ID utilisateur requis']
  },
  droits: {
    type: String,
    enum: ['standard', 'super'],
    default: 'standard'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour accéder aux informations de l'utilisateur
adminSchema.virtual('utilisateur', {
  ref: 'Utilisateur',
  localField: 'idUtilisateur',
  foreignField: '_id',
  justOne: true
});

// Middleware pour inclure automatiquement l'utilisateur
adminSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'utilisateur',
    select: 'nom prenom email'
  });
  next();
});

const Admin = mongoose.model('Admin', adminSchema, 'admins');

module.exports = Admin;
