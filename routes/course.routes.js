const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @route   GET /api/courses
 * @desc    Récupérer tous les cours
 * @access  Public (avec authentification)
 */
router.get(
  '/', 
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken,
  courseController.getAllCourses
);

/**
 * @route   GET /api/courses/:id
 * @desc    Récupérer un cours par son ID
 * @access  Public (avec authentification)
 */
router.get(
  '/:id',
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken,
  courseController.getCourseById
);

/**
 * @route   GET /api/courses/subject/:subjectId
 * @desc    Récupérer les cours par matière
 * @access  Public (avec authentification)
 */
router.get(
  '/subject/:subjectId',
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken,
  courseController.getCoursesBySubject
);

/**
 * @route   POST /api/courses
 * @desc    Créer un nouveau cours
 * @access  Admin
 */
router.post(
  '/',
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken,
  // authMiddleware.authorizeRoles('admin'),
  courseController.createCourse
);

/**
 * @route   PUT /api/courses/:id
 * @desc    Mettre à jour un cours
 * @access  Admin
 */
router.put(
  '/:id',
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken,
  // authMiddleware.authorizeRoles('admin'),
  courseController.updateCourse
);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Supprimer un cours
 * @access  Admin
 */
router.delete(
  '/:id',
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken,
  // authMiddleware.authorizeRoles('admin'),
  courseController.deleteCourse
);

module.exports = router;