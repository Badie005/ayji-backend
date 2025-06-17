// backend/models/Utilisateur.js
const mongoose = require('mongoose');

// Définir le schéma Mongoose pour un utilisateur
const utilisateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['etudiant', 'admin'], 
    default: 'etudiant',
    required: true 
  }
}, { timestamps: true }); // Ajouter timestamps pour createdAt et updatedAt

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;