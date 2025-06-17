const mongoose = require('mongoose');

// Schéma pour les options de réponse
const optionSchema = new mongoose.Schema({
  texteOption: {
    type: String,
    required: [true, 'Le texte de l\'option est requis'],
    trim: true
  },
  estCorrecte: {
    type: Boolean,
    required: true,
    default: false
  },
  idQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'L\'ID de la question est requis']
  }
});

// Schéma pour les questions
const questionSchema = new mongoose.Schema({
  texteQuestion: {
    type: String,
    required: [true, 'Le texte de la question est requis'],
    trim: true
  },
  points: {
    type: Number,
    required: [true, 'Le nombre de points est requis'],
    default: 1
  },
  type: {
    type: String,
    enum: ['Choix unique', 'Choix multiple'],
    default: 'Choix unique'
  },
  idQCM: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'L\'ID du QCM est requis']
  },
  explication: {
    type: String,
    trim: true
  }
});

// Création des modèles
const Question = mongoose.model('Question', questionSchema, 'questions');
const Option = mongoose.model('Option', optionSchema, 'options');

module.exports = { Question, Option };