const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Course = require('../models/course.model');
const { verifyToken, isAdmin } = require('../middleware/auth');
const path = require('path');

// Middleware pour vérifier si le cours existe
const courseExists = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cours non trouvé' 
      });
    }
    req.course = course;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la recherche du cours', 
      error: error.message 
    });
  }
};

// Route pour télécharger le PDF principal d'un cours
router.post('/course/:courseId/pdf', verifyToken, isAdmin, courseExists, upload.single('coursePdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier PDF fourni' 
      });
    }

    // Chemin relatif pour stocker dans la base de données
    const pdfPath = `/uploads/courses/${req.file.filename}`;
    
    // Mettre à jour le cours avec l'URL du PDF
    req.course.coursePdfUrl = pdfPath;
    await req.course.save();

    return res.status(200).json({
      success: true,
      message: 'PDF du cours téléchargé avec succès',
      data: {
        courseId: req.course._id,
        coursePdfUrl: pdfPath
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du téléchargement du PDF', 
      error: error.message 
    });
  }
});

// Route pour télécharger le PDF d'exercices d'un cours
router.post('/course/:courseId/exercise-pdf', verifyToken, isAdmin, courseExists, upload.single('exercisePdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier PDF d\'exercices fourni' 
      });
    }

    // Chemin relatif pour stocker dans la base de données
    const pdfPath = `/uploads/courses/${req.file.filename}`;
    
    // Mettre à jour le cours avec l'URL du PDF
    req.course.exercisePdfUrl = pdfPath;
    await req.course.save();

    return res.status(200).json({
      success: true,
      message: 'PDF d\'exercices téléchargé avec succès',
      data: {
        courseId: req.course._id,
        exercisePdfUrl: pdfPath
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du téléchargement du PDF d\'exercices', 
      error: error.message 
    });
  }
});

// Route pour télécharger le PDF de QCM d'un cours
router.post('/course/:courseId/qcm-pdf', verifyToken, isAdmin, courseExists, upload.single('qcmPdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier PDF de QCM fourni' 
      });
    }

    // Chemin relatif pour stocker dans la base de données
    const pdfPath = `/uploads/courses/${req.file.filename}`;
    
    // Mettre à jour le cours avec l'URL du PDF
    req.course.qcmPdfUrl = pdfPath;
    await req.course.save();

    return res.status(200).json({
      success: true,
      message: 'PDF de QCM téléchargé avec succès',
      data: {
        courseId: req.course._id,
        qcmPdfUrl: pdfPath
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du téléchargement du PDF de QCM', 
      error: error.message 
    });
  }
});

// Route pour récupérer un fichier PDF
router.get('/pdf/:filename', verifyToken, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/uploads/courses', filename);
  res.sendFile(filePath);
});

module.exports = router;
