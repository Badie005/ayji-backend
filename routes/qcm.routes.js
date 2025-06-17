const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const qcmController = require('../controllers/qcm.controller');

// Get all QCMs
router.get('/', verifyToken, qcmController.getAllQCM);

// Get QCM by ID
router.get('/:id', verifyToken, qcmController.getQCMById);

// Get QCMs by course
router.get('/course/:courseId', verifyToken, qcmController.getQCMByCourse);

// Create a new QCM (admin only)
router.post('/', [verifyToken, isAdmin], qcmController.createQCM);

// Create QCM for OSI course (admin only)
router.post('/create-osi-qcm', [verifyToken, isAdmin], qcmController.createOSIQCM);

// Update a QCM (admin only)
router.put('/:id', [verifyToken, isAdmin], qcmController.updateQCM);

// Delete a QCM (admin only)
router.delete('/:id', [verifyToken, isAdmin], qcmController.deleteQCM);

// Get QCM attempts by user (à implémenter plus tard)
router.get('/attempts/:userId', verifyToken, async (req, res) => {
  try {
    // À implémenter en fonction de votre collection tentativesQCM
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des tentatives de QCM',
      error: error.message 
    });
  }
});

module.exports = router;
