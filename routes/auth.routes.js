const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Inscrire un nouvel utilisateur
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connecter un utilisateur
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/register-admin
 * @desc    Créer un utilisateur administrateur
 * @access  Admin
 */
router.post(
  '/register-admin', 
  authMiddleware.verifyToken, 
  authMiddleware.authorizeRoles('admin'), 
  authController.registerAdmin
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);

module.exports = router;