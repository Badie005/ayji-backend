const mongoose = require('mongoose');
const path = require('path');

// Importation des modèles depuis le fichier progress.model.js
const progressModels = require('../models/progress.model');
const { Progression, QuizAttempt, Answer } = progressModels;

/**
 * @desc    Récupérer la progression d'un utilisateur pour tous les cours
 * @route   GET /api/progress/user/:userId
 * @access  Private
 */
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Récupérer toutes les progressions de l'utilisateur
    const progressions = await Progression.find({ idEtudiant: userId })
      .populate('idCours', 'title');
    
    res.status(200).json({
      success: true,
      count: progressions.length,
      data: progressions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des progressions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des progressions',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer la progression d'un utilisateur pour un cours spécifique
 * @route   GET /api/progress/user/:userId/course/:courseId
 * @access  Private
 */
exports.getUserCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    console.log(`Récupération de progression - Utilisateur: ${userId}, Cours: ${courseId}`);
    
    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      console.warn(`Tentative de récupération avec IDs invalides - Utilisateur: ${userId}, Cours: ${courseId}`);
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur ou ID cours invalide'
      });
    }
    
    // Rechercher la progression existante
    const progression = await Progression.findOne({
      idEtudiant: userId,
      idCours: courseId
    });
    
    if (progression) {
      console.log(`Progression trouvée pour l'utilisateur ${userId} et le cours ${courseId}:`, {
        pourcentage: progression.pourcentage,
        statut: progression.statut,
        tempsTotal: progression.tempsTotal
      });
      return res.status(200).json({
        success: true,
        message: 'Progression récupérée avec succès',
        data: progression
      });
    } else {
      console.log(`Aucune progression trouvée pour l'utilisateur ${userId} et le cours ${courseId}`);
      return res.status(200).json({
        success: true,
        message: 'Aucune progression trouvée pour ce cours',
        data: null
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la progression du cours',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour ou créer la progression d'un utilisateur pour un cours
 * @route   POST /api/progress/user/:userId/course/:courseId
 * @access  Private
 */
exports.updateUserCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { statut, pourcentage, tempsTotal } = req.body;
    
    console.log(`Mise à jour de progression - Utilisateur: ${userId}, Cours: ${courseId}`);
    console.log('Données reçues:', { statut, pourcentage, tempsTotal });
    
    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      console.warn(`Tentative de mise à jour avec IDs invalides - Utilisateur: ${userId}, Cours: ${courseId}`);
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur ou ID cours invalide'
      });
    }
    
    // Valider les données d'entrée
    if (pourcentage !== undefined && (pourcentage < 0 || pourcentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Le pourcentage doit être compris entre 0 et 100'
      });
    }
    
    if (tempsTotal !== undefined && tempsTotal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Le temps total ne peut pas être négatif'
      });
    }
    
    // Valider le statut
    const statutsValides = ['Non commencé', 'En cours', 'Terminé'];
    if (statut && !statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Les statuts valides sont: ${statutsValides.join(', ')}`
      });
    }
    
    // Préparer les données à mettre à jour (ignorer les valeurs undefined)
    const updateData = {};
    
    if (statut !== undefined) updateData.statut = statut;
    if (pourcentage !== undefined) updateData.pourcentage = pourcentage;
    if (tempsTotal !== undefined) updateData.tempsTotal = tempsTotal;
    
    // Toujours mettre à jour la date de dernier accès
    updateData.dernierAcces = new Date();
    
    console.log('Données à mettre à jour:', updateData);
    
    // Rechercher et mettre à jour la progression, ou créer une nouvelle si elle n'existe pas
    // Utiliser une session pour assurer la cohérence des données
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Rechercher d'abord la progression existante pour combiner les données si nécessaire
      let existingProgression = await Progression.findOne(
        { idEtudiant: userId, idCours: courseId },
        null,
        { session }
      );
      
      // Si une progression existe, utiliser des opérateurs atomiques pour une mise à jour sécurisée
      if (existingProgression) {
        // Définir les mises à jour atomiques
        const atomicUpdates = {};
        
        // Mise à jour atomique du temps total (additionner sans remplacer)
        if (tempsTotal !== undefined) {
          // Vérifier et limiter les valeurs extrêmes pour éviter les abus
          const safeTempsTotal = Math.min(Math.max(0, tempsTotal), 7200); // Limiter à 2h max par mise à jour
          atomicUpdates['$inc'] = { tempsTotal: safeTempsTotal };
        }
        
        // Gérer le pourcentage (prendre toujours le plus élevé)
        if (pourcentage !== undefined) {
          // S'assurer que le pourcentage est dans les limites acceptables
          const safePourcentage = Math.min(Math.max(0, pourcentage), 100);
          
          // Utiliser l'opérateur $max pour garantir de prendre la valeur maximale entre l'existant et le nouveau
          if (!atomicUpdates['$max']) atomicUpdates['$max'] = {};
          atomicUpdates['$max'].pourcentage = safePourcentage;
        }
        
        // Déterminer le statut basé sur le pourcentage (attention: on ne peut pas utiliser les valeurs mises à jour dans atomicUpdates)
        if (statut !== undefined) {
          if (!atomicUpdates['$set']) atomicUpdates['$set'] = {};
          atomicUpdates['$set'].statut = statut;
        } else {
          // Déterminer le statut en fonction du nouveau pourcentage (si fourni) ou du pourcentage existant
          const basePercentage = pourcentage !== undefined ? Math.max(pourcentage, existingProgression.pourcentage || 0) : existingProgression.pourcentage || 0;
          
          // Mettre à jour le statut uniquement si nécessaire
          let newStatus;
          if (basePercentage >= 100) {
            newStatus = 'Terminé';
          } else if (basePercentage > 0) {
            newStatus = 'En cours';
          } else {
            newStatus = 'Non commencé';
          }
          
          // Ne mettre à jour que si le status est différent
          if (newStatus !== existingProgression.statut) {
            if (!atomicUpdates['$set']) atomicUpdates['$set'] = {};
            atomicUpdates['$set'].statut = newStatus;
          }
        }
        
        // Toujours mettre à jour la date de dernier accès
        if (!atomicUpdates['$set']) atomicUpdates['$set'] = {};
        atomicUpdates['$set'].dernierAcces = new Date();
        
        // Journalisation détaillée pour le débogage
        console.log(`Mise à jour atomique pour l'utilisateur ${userId} et le cours ${courseId}:`, JSON.stringify(atomicUpdates));
        
        // Rechercher et mettre à jour la progression avec des opérations atomiques
        const progression = await Progression.findOneAndUpdate(
          { idEtudiant: userId, idCours: courseId },
          atomicUpdates,
          { 
            new: true, 
            upsert: true, 
            setDefaultsOnInsert: true,
            session
          }
        );
        
        console.log(`Progression mise à jour avec succès, ID: ${progression._id}, Pourcentage: ${progression.pourcentage}, Temps: ${progression.tempsTotal}`);
      } else {
        // Cas où aucune progression n'existe encore - créer une nouvelle
        // Préparer les données initiales
        const initialData = {
          idEtudiant: userId,
          idCours: courseId,
          dernierAcces: new Date()
        };
        
        // Ajouter les valeurs reçues si elles sont définies
        if (statut !== undefined) initialData.statut = statut;
        if (pourcentage !== undefined) initialData.pourcentage = Math.min(Math.max(0, pourcentage), 100);
        if (tempsTotal !== undefined) initialData.tempsTotal = Math.max(0, Math.min(tempsTotal, 7200));
        
        // Déterminer le statut si non spécifié
        if (statut === undefined) {
          if (initialData.pourcentage >= 100) {
            initialData.statut = 'Terminé';
          } else if (initialData.pourcentage > 0) {
            initialData.statut = 'En cours';
          } else {
            initialData.statut = 'Non commencé';
          }
        }
        
        console.log(`Création d'une nouvelle progression pour ${userId} et le cours ${courseId}:`, JSON.stringify(initialData));
        
        // Créer la progression initiale
        const progression = await Progression.create([initialData], { session });
        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({
          success: true,
          message: 'Progression initiale créée avec succès',
          data: progression[0]
        });
        return; // Important: sortir de la fonction ici
      }
      
      await session.commitTransaction();
      session.endSession();
      
      console.log('Progression mise à jour avec succès, ID:', progression._id);
      
      res.status(200).json({
        success: true,
        message: 'Progression mise à jour avec succès',
        data: progression
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError; // Relancer l'erreur pour qu'elle soit attrapée par le bloc catch principal
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    
    // Gérer les différents types d'erreurs
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation des données',
        details: error.errors,
        error: error.message
      });
    } else if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Conflit de données',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la progression',
      error: error.message
    });
  }
};

/**
 * @desc    Enregistrer une tentative de QCM
 * @route   POST /api/progress/quiz-attempt
 * @access  Private
 */
exports.saveQuizAttempt = async (req, res) => {
  try {
    const { idEtudiant, idQCM, score, duree, termine, reponses } = req.body;
    
    console.log(`Enregistrement d'une tentative de QCM - Étudiant: ${idEtudiant}, QCM: ${idQCM}`);
    console.log('Données reçues:', { score, duree, termine, 'nb_reponses': reponses?.length || 0 });
    
    // Vérifier si les IDs sont valides
    if (!mongoose.Types.ObjectId.isValid(idEtudiant) || !mongoose.Types.ObjectId.isValid(idQCM)) {
      console.warn(`Tentative avec IDs invalides - Étudiant: ${idEtudiant}, QCM: ${idQCM}`);
      return res.status(400).json({
        success: false,
        message: 'ID étudiant ou ID QCM invalide'
      });
    }
    
    // Valider les données d'entrée
    if (score !== undefined && (score < 0 || score > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Le score doit être compris entre 0 et 100'
      });
    }
    
    if (duree !== undefined && duree < 0) {
      return res.status(400).json({
        success: false,
        message: 'La durée ne peut pas être négative'
      });
    }
    
    // Valider les réponses si elles sont fournies
    if (reponses) {
      if (!Array.isArray(reponses)) {
        return res.status(400).json({
          success: false,
          message: 'Le format des réponses est invalide, doit être un tableau'
        });
      }
      
      for (const reponse of reponses) {
        if (!reponse.idQuestion || !reponse.idOption) {
          return res.status(400).json({
            success: false,
            message: 'Chaque réponse doit contenir idQuestion et idOption'
          });
        }
        
        if (!mongoose.Types.ObjectId.isValid(reponse.idQuestion) || 
            !mongoose.Types.ObjectId.isValid(reponse.idOption)) {
          return res.status(400).json({
            success: false,
            message: 'Les IDs de question ou d\'option sont invalides'
          });
        }
      }
    }
    
    // Utiliser une transaction pour garantir la cohérence des données
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Créer une nouvelle tentative de QCM
      const quizAttempt = await QuizAttempt.create([{
        idEtudiant,
        idQCM,
        score: score || 0,
        duree: duree || 0,
        termine: termine || false,
        date: new Date()
      }], { session });
      
      const attemptId = quizAttempt[0]._id;
      console.log(`Tentative de QCM créée avec ID: ${attemptId}`);
      
      // Si des réponses ont été fournies, les enregistrer
      if (reponses && reponses.length > 0) {
        const answersToCreate = reponses.map(reponse => ({
          idTentative: attemptId,
          idQuestion: reponse.idQuestion,
          idOption: reponse.idOption
        }));
        
        // Créer toutes les réponses en une seule opération (plus efficace)
        const answers = await Answer.create(answersToCreate, { session });
        console.log(`${answers.length} réponses enregistrées pour la tentative ${attemptId}`);
      }
      
      // Si l'utilisateur a terminé le QCM, mettre à jour sa progression
      if (termine) {
        // Vérifier si une progression existe déjà pour ce cours
        // Ici vous auriez besoin de la relation entre QCM et Cours
        // Supposons qu'il y a une relation directe idCours dans le QCM
        // Vous devrez adapter cette partie selon votre modèle de données
        
        /* Example code (commenté car dépend de votre modèle)
        const qcm = await QCM.findById(idQCM).session(session);
        if (qcm && qcm.idCours) {
          // Mettre à jour la progression
          await Progression.findOneAndUpdate(
            { idEtudiant, idCours: qcm.idCours },
            { 
              $inc: { tentativesQCM: 1 },
              $set: { dernierAcces: new Date() }
            },
            { upsert: true, new: true, session }
          );
          console.log(`Progression mise à jour pour l'étudiant ${idEtudiant} et le cours lié au QCM ${idQCM}`);
        }
        */
      }
      
      await session.commitTransaction();
      session.endSession();
      
      res.status(201).json({
        success: true,
        message: 'Tentative de QCM enregistrée avec succès',
        data: quizAttempt[0]
      });
    } catch (transactionError) {
      console.error('Erreur durant la transaction:', transactionError);
      await session.abortTransaction();
      session.endSession();
      throw transactionError; // Relancer l'erreur pour le bloc catch principal
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative de QCM:', error);
    
    // Gérer les différents types d'erreurs
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation des données',
        details: error.errors,
        error: error.message
      });
    } else if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Conflit de données - Cette réponse a déjà été enregistrée',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la tentative de QCM',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les tentatives de QCM d'un utilisateur
 * @route   GET /api/progress/quiz-attempt/user/:userId
 * @access  Private
 */
exports.getUserQuizAttempts = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Récupérer toutes les tentatives de QCM de l'utilisateur
    const quizAttempts = await QuizAttempt.find({ idEtudiant: userId })
      .populate('idQCM', 'title')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: quizAttempts.length,
      data: quizAttempts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tentatives de QCM:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tentatives de QCM',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les réponses d'une tentative de QCM
 * @route   GET /api/progress/quiz-attempt/:attemptId/answers
 * @access  Private
 */
exports.getQuizAttemptAnswers = async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de tentative invalide'
      });
    }
    
    // Récupérer toutes les réponses de la tentative
    const answers = await Answer.find({ idTentative: attemptId })
      .populate('idQuestion', 'texte')
      .populate('idOption', 'texte estCorrect');
    
    res.status(200).json({
      success: true,
      count: answers.length,
      data: answers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réponses',
      error: error.message
    });
  }
};
