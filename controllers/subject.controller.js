const Subject = require('../models/subject.model');

/**
 * @desc    Créer une nouvelle matière
 * @route   POST /api/subjects
 * @access  Admin
 */
exports.createSubject = async (req, res) => {
  try {
    const { nomMatiere, description, image } = req.body;

    // Vérifier si la matière existe déjà
    const existingSubject = await Subject.findOne({ nomMatiere });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà'
      });
    }

    // Créer la nouvelle matière
    const subject = await Subject.create({
      nomMatiere,
      description,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Matière créée avec succès',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la matière',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer toutes les matières
 * @route   GET /api/subjects
 * @access  Public
 */
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des matières',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer une matière par son ID
 * @route   GET /api/subjects/:id
 * @access  Public
 */
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la matière',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour une matière
 * @route   PUT /api/subjects/:id
 * @access  Admin
 */
exports.updateSubject = async (req, res) => {
  try {
    const { nomMatiere, description, image } = req.body;

    // Vérifier si la matière existe
    let subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    // Vérifier si le nom de la matière est déjà utilisé par une autre matière
    if (nomMatiere && nomMatiere !== subject.nomMatiere) {
      const existingSubject = await Subject.findOne({ nomMatiere });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom de matière est déjà utilisé'
        });
      }
    }

    // Mettre à jour la matière
    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { nomMatiere, description, image, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Matière mise à jour avec succès',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la matière',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer une matière
 * @route   DELETE /api/subjects/:id
 * @access  Admin
 */
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Matière supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la matière',
      error: error.message
    });
  }
};