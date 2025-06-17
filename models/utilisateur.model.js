const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Schéma Utilisateur
const utilisateurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      'Veuillez fournir un email valide'
    ]
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware pour hacher le mot de passe avant la sauvegarde
utilisateurSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
  next();
});

// Méthode pour comparer les mots de passe
utilisateurSchema.methods.compareMotDePasse = async function(motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

// Méthode pour générer un JWT
utilisateurSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Définir les virtuals pour accéder aux données d'admin ou d'étudiant
utilisateurSchema.virtual('admin', {
  ref: 'Admin',
  localField: '_id',
  foreignField: 'idUtilisateur',
  justOne: true
});

utilisateurSchema.virtual('etudiant', {
  ref: 'Etudiant',
  localField: '_id',
  foreignField: 'idUtilisateur',
  justOne: true
});

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema, 'utilisateurs');

module.exports = Utilisateur;
