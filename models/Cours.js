// backend/models/Cours.js
const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  contenu: { type: String, required: true },
  image: { type: String }, // URL de l'image du cours
  dateCreation: { type: Date, default: Date.now },
  categories: [String],
  niveau: {
    type: String,
    enum: ['débutant', 'intermédiaire', 'avancé'],
    default: 'débutant'
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
}, { timestamps: true });

const Cours = mongoose.model('Cours', coursSchema);

module.exports = Cours;