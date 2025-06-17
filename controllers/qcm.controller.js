const QCM = require('../models/qcm.model');
const { Question, Option } = require('../models/question.model');
const Course = require('../models/course.model');
const mongoose = require('mongoose');

/**
 * @desc    Récupérer tous les QCM
 * @route   GET /api/qcm
 * @access  Public (avec authentification)
 */
exports.getAllQCM = async (req, res) => {
  try {
    const qcms = await QCM.find().populate('questions');
    res.status(200).json({
      success: true,
      count: qcms.length,
      data: qcms
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des QCM:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des QCM',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer un QCM par son ID
 * @route   GET /api/qcm/:id
 * @access  Public (avec authentification)
 */
exports.getQCMById = async (req, res) => {
  try {
    const qcm = await QCM.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }
    
    // Récupérer les questions associées
    const questions = await Question.find({ idQCM: qcm._id });
    
    // Pour chaque question, récupérer les options
    const questionsWithOptions = await Promise.all(questions.map(async (question) => {
      const options = await Option.find({ idQuestion: question._id });
      return {
        ...question.toObject(),
        options
      };
    }));
    
    res.status(200).json({
      success: true,
      data: {
        ...qcm.toObject(),
        questions: questionsWithOptions
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du QCM:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du QCM',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les QCM par cours
 * @route   GET /api/qcm/course/:courseId
 * @access  Public (avec authentification)
 */
exports.getQCMByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    // Vérifier si le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Récupérer les QCM associés au cours
    const qcms = await QCM.find({ idCours: courseId });
    
    res.status(200).json({
      success: true,
      count: qcms.length,
      data: qcms
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des QCM du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des QCM du cours',
      error: error.message
    });
  }
};

/**
 * @desc    Créer un nouveau QCM
 * @route   POST /api/qcm
 * @access  Admin
 */
exports.createQCM = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { titre, tempsLimite, idCours, idAdmin, questions } = req.body;
    
    // Créer le QCM
    const qcm = new QCM({
      titre,
      dateCreation: new Date(),
      tempsLimite,
      idCours,
      idAdmin
    });
    
    await qcm.save({ session });
    
    // Si des questions sont fournies, les créer
    if (questions && Array.isArray(questions)) {
      for (const questionData of questions) {
        const { texteQuestion, points, type, explication, options } = questionData;
        
        // Créer la question
        const question = new Question({
          texteQuestion,
          points: points || 1,
          type: type || 'Choix unique',
          idQCM: qcm._id,
          explication
        });
        
        await question.save({ session });
        
        // Créer les options si fournies
        if (options && Array.isArray(options)) {
          for (const optionData of options) {
            const { texteOption, estCorrecte } = optionData;
            
            const option = new Option({
              texteOption,
              estCorrecte: estCorrecte || false,
              idQuestion: question._id
            });
            
            await option.save({ session });
          }
        }
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: 'QCM créé avec succès',
      data: qcm
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur lors de la création du QCM:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du QCM',
      error: error.message
    });
  }
};

/**
 * @desc    Créer le QCM pour le cours 2_OSI_VE+
 * @route   POST /api/qcm/create-osi-qcm
 * @access  Admin
 */
exports.createOSIQCM = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Vérifier si le cours existe
    const course = await Course.findOne({ title: '2_OSI_VE+' });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours 2_OSI_VE+ non trouvé'
      });
    }
    
    // Vérifier si un QCM existe déjà pour ce cours
    const existingQCM = await QCM.findOne({ idCours: course._id });
    
    if (existingQCM) {
      return res.status(400).json({
        success: false,
        message: 'Un QCM existe déjà pour ce cours'
      });
    }
    
    // Créer le QCM
    const qcm = new QCM({
      titre: 'QCM sur le Modèle OSI et Adressage IP',
      dateCreation: new Date(),
      tempsLimite: 60, // 60 minutes
      idCours: course._id,
      idAdmin: req.user._id // Supposé que l'ID admin est disponible via req.user
    });
    
    await qcm.save({ session });
    
    // Série 1: Classes d'adresses IP
    const questions = [
      // Question 1
      {
        texteQuestion: 'Quelle est la classe de l\'adresse IP 10.0.0.1 ?',
        options: [
          { texteOption: 'Classe A', estCorrecte: true },
          { texteOption: 'Classe B', estCorrecte: false },
          { texteOption: 'Classe C', estCorrecte: false },
          { texteOption: 'Classe D', estCorrecte: false }
        ],
        explication: 'Les adresses dont le premier octet va de 1 à 126 sont en classe A.'
      },
      // Question 2
      {
        texteQuestion: 'Quelle est la classe de l\'adresse IP 192.117.3.1 ?',
        options: [
          { texteOption: 'A', estCorrecte: false },
          { texteOption: 'B', estCorrecte: false },
          { texteOption: 'C', estCorrecte: true },
          { texteOption: 'D', estCorrecte: false }
        ],
        explication: 'Les adresses de 192 à 223 appartiennent à la classe C.'
      },
      // Question 3
      {
        texteQuestion: 'L\'adresse IP 226.8.55.130 appartient à la classe ?',
        options: [
          { texteOption: 'A', estCorrecte: false },
          { texteOption: 'B', estCorrecte: false },
          { texteOption: 'C', estCorrecte: false },
          { texteOption: 'D (multidiffusion)', estCorrecte: true }
        ],
        explication: 'Les adresses de 224 à 239 sont réservées à la multidiffusion (classe D).'
      },
      // Autres questions de la série 1...
      // Série 2: Masques et parties Réseau/Hôte
      // ... Ajouter les autres questions de façon similaire
    ];
    
    // Créer chaque question et ses options
    for (const questionData of questions) {
      const question = new Question({
        texteQuestion: questionData.texteQuestion,
        points: 1,
        type: 'Choix unique',
        idQCM: qcm._id,
        explication: questionData.explication
      });
      
      await question.save({ session });
      
      // Créer les options
      for (const optionData of questionData.options) {
        const option = new Option({
          texteOption: optionData.texteOption,
          estCorrecte: optionData.estCorrecte,
          idQuestion: question._id
        });
        
        await option.save({ session });
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: 'QCM OSI créé avec succès',
      data: qcm
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur lors de la création du QCM OSI:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du QCM OSI',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un QCM
 * @route   PUT /api/qcm/:id
 * @access  Admin
 */
exports.updateQCM = async (req, res) => {
  try {
    const qcm = await QCM.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'QCM mis à jour avec succès',
      data: qcm
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du QCM:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du QCM',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un QCM
 * @route   DELETE /api/qcm/:id
 * @access  Admin
 */
exports.deleteQCM = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Vérifier si le QCM existe
    const qcm = await QCM.findById(req.params.id);
    
    if (!qcm) {
      return res.status(404).json({
        success: false,
        message: 'QCM non trouvé'
      });
    }
    
    // Supprimer les options et questions associées
    const questions = await Question.find({ idQCM: qcm._id });
    
    for (const question of questions) {
      await Option.deleteMany({ idQuestion: question._id }, { session });
    }
    
    await Question.deleteMany({ idQCM: qcm._id }, { session });
    
    // Supprimer le QCM
    await QCM.findByIdAndDelete(req.params.id, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({
      success: true,
      message: 'QCM supprimé avec succès'
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur lors de la suppression du QCM:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du QCM',
      error: error.message
    });
  }
};
