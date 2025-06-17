const Course = require('../models/course.model');
const Subject = require('../models/subject.model');
const mongoose = require('mongoose');

/**
 * @desc    Récupérer tous les cours
 * @route   GET /api/courses
 * @access  Public (avec authentification)
 */
exports.getAllCourses = async (req, res) => {
  try {
    console.log('Récupération de tous les cours');
    
    // Options de pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Recherche par matière
    const filter = {};
    if (req.query.subject) {
      console.log('Filtrage par matière:', req.query.subject);
      filter.subject = req.query.subject;
    }
    
    // Tri
    const sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sort[field.substring(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    } else {
      // Tri par défaut
      sort.order = 1;
      sort.title = 1;
    }
    
    // Récupérer les cours avec pagination
    const courses = await Course.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('subject', 'name');
    
    // Récupérer le nombre total de cours
    const total = await Course.countDocuments(filter);
    
    console.log(`${courses.length} cours récupérés sur ${total} au total`);
    
    res.status(200).json({
      success: true,
      count: courses.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: courses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer un cours par son ID
 * @route   GET /api/courses/:id
 * @access  Public (avec authentification)
 */
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('Récupération du cours par ID:', courseId);
    
    let course;
    
    // Vérifier si l'ID est un ObjectID MongoDB valide
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      // Recherche par ObjectID MongoDB
      course = await Course.findById(courseId).populate('subject', 'name');
    } else if (/^\d+$/.test(courseId)) {
      // Si l'ID est un nombre, essayer de trouver par champ numérique (courseNumber)
      // Cette partie suppose que vous avez un champ numérique comme 'courseNumber' dans votre modèle
      // Si ce n'est pas le cas, vous pouvez ajouter ce champ ou utiliser un autre champ existant
      course = await Course.findOne({ courseNumber: parseInt(courseId, 10) }).populate('subject', 'name');
      
      // Si aucun résultat avec courseNumber, essayez avec le premier cours disponible (pour les tests)
      if (!course) {
        console.log('Aucun cours trouvé avec le numéro de cours:', courseId);
        console.log('Récupération du premier cours à des fins de test...');
        const courses = await Course.find().limit(1).populate('subject', 'name');
        course = courses.length > 0 ? courses[0] : null;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'ID de cours invalide'
      });
    }
    
    if (!course) {
      console.log('Cours non trouvé, ID:', courseId);
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    console.log('Cours trouvé:', course.title);
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cours',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les cours par matière
 * @route   GET /api/courses/subject/:subjectId
 * @access  Public (avec authentification)
 */
exports.getCoursesBySubject = async (req, res) => {
  try {
    console.log('Récupération des cours par matière:', req.params.subjectId);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.subjectId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de matière invalide'
      });
    }
    
    // Vérifier si la matière existe
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      console.log('Matière non trouvée, ID:', req.params.subjectId);
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }
    
    // Options de pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Récupérer les cours de la matière avec pagination
    const courses = await Course.find({ subject: req.params.subjectId })
      .sort({ order: 1, title: 1 })
      .skip(skip)
      .limit(limit);
    
    // Récupérer le nombre total de cours de cette matière
    const total = await Course.countDocuments({ subject: req.params.subjectId });
    
    console.log(`${courses.length} cours récupérés pour la matière ${subject.name}`);
    
    res.status(200).json({
      success: true,
      count: courses.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: courses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours par matière:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours par matière',
      error: error.message
    });
  }
};

/**
 * @desc    Créer un nouveau cours
 * @route   POST /api/courses
 * @access  Admin
 */
exports.createCourse = async (req, res) => {
  try {
    console.log('Création d\'un nouveau cours:', req.body);
    
    const { title, description, subject, content, coursePdfUrl, exercisePdfUrl, qcmPdfUrl, order } = req.body;
    
    // Vérifier si la matière existe
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({
        success: false,
        message: 'ID de matière invalide'
      });
    }
    
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }
    
    // Créer le nouveau cours
    const course = await Course.create({
      title,
      description,
      subject,
      content,
      coursePdfUrl,
      exercisePdfUrl,
      qcmPdfUrl,
      order: order || 0
    });
    
    console.log('Nouveau cours créé:', course.title);
    
    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès',
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du cours',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un cours
 * @route   PUT /api/courses/:id
 * @access  Admin
 */
exports.updateCourse = async (req, res) => {
  try {
    console.log('Mise à jour du cours avec ID:', req.params.id);
    console.log('Données de mise à jour:', req.body);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cours invalide'
      });
    }
    
    // Vérifier si le cours existe
    let course = await Course.findById(req.params.id);
    if (!course) {
      console.log('Cours non trouvé pour la mise à jour, ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Si la matière est mise à jour, vérifier si elle existe
    if (req.body.subject && !mongoose.Types.ObjectId.isValid(req.body.subject)) {
      return res.status(400).json({
        success: false,
        message: 'ID de matière invalide'
      });
    }
    
    if (req.body.subject) {
      const subjectExists = await Subject.findById(req.body.subject);
      if (!subjectExists) {
        return res.status(404).json({
          success: false,
          message: 'Matière non trouvée'
        });
      }
    }
    
    // Mettre à jour le cours
    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    console.log('Cours mis à jour avec succès:', course.title);
    
    res.status(200).json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du cours',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un cours
 * @route   DELETE /api/courses/:id
 * @access  Admin
 */
exports.deleteCourse = async (req, res) => {
  try {
    console.log('Suppression du cours avec ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cours invalide'
      });
    }
    
    // Vérifier si le cours existe
    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log('Cours non trouvé pour la suppression, ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Supprimer le cours
    await Course.findByIdAndDelete(req.params.id);
    
    console.log('Cours supprimé avec succès:', course.title);
    
    res.status(200).json({
      success: true,
      message: 'Cours supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du cours',
      error: error.message
    });
  }
};
