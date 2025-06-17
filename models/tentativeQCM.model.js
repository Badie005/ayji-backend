const mongoose = require('mongoose');

// Schéma TentativeQCM
const tentativeQCMSchema = new mongoose.Schema({
  idEtudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etudiant',
    required: [true, 'L\'ID de l\'étudiant est requis']
  },
  idQCM: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QCM',
    required: [true, 'L\'ID du QCM est requis']
  },
  date: {
    type: Date,
    required: [true, 'La date de la tentative est requise'],
    default: Date.now
  },
  score: {
    type: Number,
    required: [true, 'Le score est requis'],
    min: 0,
    max: 100,
    default: 0
  },
  duree: {
    type: Number,
    comment: 'Durée en secondes'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual pour accéder aux réponses liées
tentativeQCMSchema.virtual('reponses', {
  ref: 'Reponse',
  localField: '_id',
  foreignField: 'idTentative'
});

// Populate automatique des références
tentativeQCMSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'idQCM',
    select: 'titre tempsLimite'
  });
  next();
});

// Méthode pour calculer le score d'une tentative
tentativeQCMSchema.methods.calculateScore = async function() {
  const Reponse = mongoose.model('Reponse');
  const { Question, Option } = require('./question.model');
  
  const reponses = await Reponse.find({ idTentative: this._id });
  let totalPoints = 0;
  let earnedPoints = 0;
  
  for (const reponse of reponses) {
    const question = await Question.findById(reponse.idQuestion);
    if (question) {
      totalPoints += question.points;
      const option = await Option.findById(reponse.idOption);
      if (option && option.estCorrecte) {
        earnedPoints += question.points;
      }
    }
  }
  
  // Mise à jour du score
  if (totalPoints > 0) {
    this.score = (earnedPoints / totalPoints) * 100;
    await this.save();
  }
  
  return this.score;
};

const TentativeQCM = mongoose.model('TentativeQCM', tentativeQCMSchema, 'tentativesQCM');

module.exports = TentativeQCM;
