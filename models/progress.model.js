const mongoose = require('mongoose');

// Schéma pour les progressions
const progressionSchema = new mongoose.Schema({
  idEtudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'L\'ID de l\'étudiant est requis']
  },
  idCours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'L\'ID du cours est requis']
  },
  statut: {
    type: String,
    enum: ['Non commencé', 'En cours', 'Terminé'],
    default: 'Non commencé'
  },
  pourcentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dernierAcces: {
    type: Date
  },
  tempsTotal: {
    type: Number, // en secondes
    default: 0
  }
}, { timestamps: true });

// Créer un index composé pour garantir l'unicité des progressions par utilisateur et cours
progressionSchema.index({ idEtudiant: 1, idCours: 1 }, { unique: true });

// Schéma pour les tentatives QCM
const quizAttemptSchema = new mongoose.Schema({
  idEtudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'L\'ID de l\'étudiant est requis']
  },
  idQCM: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'L\'ID du QCM est requis']
  },
  date: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    default: 0
  },
  duree: {
    type: Number, // en secondes
    default: 0
  },
  termine: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ajouter un index pour optimiser les recherches par utilisateur
// Note: On ne met pas d'index unique ici car un utilisateur peut avoir plusieurs tentatives pour un même QCM
quizAttemptSchema.index({ idEtudiant: 1, idQCM: 1, date: -1 });

// Schéma pour les réponses aux questions
const answerSchema = new mongoose.Schema({
  idTentative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizAttempt',
    required: [true, 'L\'ID de la tentative est requis']
  },
  idQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'L\'ID de la question est requis']
  },
  idOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Option',
    required: [true, 'L\'ID de l\'option est requis']
  }
}, { timestamps: true });

// Index pour optimiser les recherches de réponses par tentative et question
// L'index composé unique empêche un étudiant de répondre plusieurs fois à la même question dans une tentative
answerSchema.index({ idTentative: 1, idQuestion: 1 }, { unique: true });

// Création des modèles
const Progression = mongoose.model('Progression', progressionSchema, 'progressions');
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema, 'tentativesQCM');
const Answer = mongoose.model('Answer', answerSchema, 'reponses');

module.exports = { Progression, QuizAttempt, Answer };