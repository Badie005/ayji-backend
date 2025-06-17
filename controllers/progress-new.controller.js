const mongoose = require('mongoose');
const path = require('path');

// Import models
const progressModel = require('../models/progress.model');
const { Progression, QuizAttempt, Answer } = progressModel;

// Controller for user course progressions
const progressController = {};

/**
 * Get progress for all courses for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
progressController.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Récupération de toutes les progressions - Utilisateur: ${userId}`);
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Get all progressions for the user
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
 * Get progress for a specific course for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
progressController.getUserCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    
    console.log(`Récupération de progression - Utilisateur: ${userId}, Cours: ${courseId}`);
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      console.warn(`Tentative de récupération avec IDs invalides - Utilisateur: ${userId}, Cours: ${courseId}`);
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur ou ID cours invalide'
      });
    }
    
    // Find user progress for the course
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
 * Update or create progress for a user and course
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
progressController.updateUserCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { statut, pourcentage, tempsTotal } = req.body;
    
    console.log(`Mise à jour de progression - Utilisateur: ${userId}, Cours: ${courseId}`);
    console.log('Données reçues:', { statut, pourcentage, tempsTotal });
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      console.warn(`Tentative de mise à jour avec IDs invalides - Utilisateur: ${userId}, Cours: ${courseId}`);
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur ou ID cours invalide'
      });
    }
    
    // Validate input data
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
    
    // Validate status
    const validStatuses = ['Non commencé', 'En cours', 'Terminé'];
    if (statut && !validStatuses.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Les statuts valides sont: ${validStatuses.join(', ')}`
      });
    }
    
    // Prepare data to update (ignore undefined values)
    const updateData = {};
    
    if (statut !== undefined) updateData.statut = statut;
    if (pourcentage !== undefined) updateData.pourcentage = pourcentage;
    if (tempsTotal !== undefined) updateData.tempsTotal = tempsTotal;
    
    // Always update last access date
    updateData.dernierAcces = new Date();
    
    console.log('Données à mettre à jour:', updateData);
    
    // Use transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find and update progress with session
      const progression = await Progression.findOneAndUpdate(
        { idEtudiant: userId, idCours: courseId },
        updateData,
        { 
          new: true, 
          upsert: true, 
          setDefaultsOnInsert: true,
          session
        }
      );
      
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
      throw transactionError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    
    // Handle different error types
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
 * Save a quiz attempt
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
progressController.saveQuizAttempt = async (req, res) => {
  try {
    const { idEtudiant, idQCM, score, duree, termine, reponses } = req.body;
    
    console.log(`Enregistrement d'une tentative de QCM - Étudiant: ${idEtudiant}, QCM: ${idQCM}`);
    console.log('Données reçues:', { score, duree, termine, 'nb_reponses': reponses?.length || 0 });
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(idEtudiant) || !mongoose.Types.ObjectId.isValid(idQCM)) {
      console.warn(`Tentative avec IDs invalides - Étudiant: ${idEtudiant}, QCM: ${idQCM}`);
      return res.status(400).json({
        success: false,
        message: 'ID étudiant ou ID QCM invalide'
      });
    }
    
    // Validate input data
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
    
    // Validate answers if provided
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
    
    // Use transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Create a new quiz attempt
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
      
      // Save answers if provided
      if (reponses && reponses.length > 0) {
        const answersToCreate = reponses.map(reponse => ({
          idTentative: attemptId,
          idQuestion: reponse.idQuestion,
          idOption: reponse.idOption
        }));
        
        // Create all answers in a single operation (more efficient)
        const answers = await Answer.create(answersToCreate, { session });
        console.log(`${answers.length} réponses enregistrées pour la tentative ${attemptId}`);
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
      throw transactionError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative de QCM:', error);
    
    // Handle different error types
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
 * Get all quiz attempts for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
progressController.getUserQuizAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }
    
    // Get all quiz attempts for the user
    const quizAttempts = await QuizAttempt.find({ idEtudiant: userId })
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
 * Get answers for a quiz attempt
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
progressController.getQuizAttemptAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    // Validate attempt ID
    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de tentative invalide'
      });
    }
    
    // Get all answers for the attempt
    const answers = await Answer.find({ idTentative: attemptId });
    
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

module.exports = progressController;
