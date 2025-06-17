const mongoose = require('mongoose');

// Schéma Reponse
const reponseSchema = new mongoose.Schema({
  idTentative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TentativeQCM',
    required: [true, 'L\'ID de la tentative est requis']
  },
  idQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'L\'ID de la question est requise']
  },
  idOption: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Option',
    required: [true, 'L\'ID de l\'option est requis']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Populate automatique des références
reponseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'idQuestion',
    select: 'texteQuestion points type'
  }).populate({
    path: 'idOption',
    select: 'texteOption estCorrecte'
  });
  next();
});

const Reponse = mongoose.model('Reponse', reponseSchema, 'reponses');

module.exports = Reponse;
