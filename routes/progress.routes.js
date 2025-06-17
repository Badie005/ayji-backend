const express = require('express');
const router = express.Router();

// Utiliser le nouveau contrôleur de progression
const progressController = require('../controllers/progress-new.controller');

// Middleware d'authentification
const { verifyToken } = require('../middleware/auth.middleware');

// Routes pour la progression des cours
router.get('/user/:userId', verifyToken, progressController.getUserProgress);
router.get('/user/:userId/course/:courseId', verifyToken, progressController.getUserCourseProgress);
router.post('/user/:userId/course/:courseId', verifyToken, progressController.updateUserCourseProgress);

// Routes pour les tentatives de QCM
router.post('/quiz-attempt', verifyToken, progressController.saveQuizAttempt);
router.get('/quiz-attempt/user/:userId', verifyToken, progressController.getUserQuizAttempts);
router.get('/quiz-attempt/:attemptId/answers', verifyToken, progressController.getQuizAttemptAnswers);

module.exports = router;
