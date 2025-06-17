const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/subject.controller');

// Routes publiques
router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);

// Routes protégées (admin uniquement)
router.post('/', verifyToken, authorizeRoles('admin'), createSubject);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateSubject);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteSubject);

module.exports = router;