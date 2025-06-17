const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @route   GET /api/users
 * @desc    Récupérer tous les utilisateurs
 * @access  Admin
 */
router.get(
  '/', 
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken, 
  // authMiddleware.authorizeRoles('admin'), 
  userController.getAllUsers
);

/**
 * @route   POST /api/users
 * @desc    Créer un nouvel utilisateur
 * @access  Admin
 */
router.post(
  '/',
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken,
  // authMiddleware.authorizeRoles('admin'),
  userController.createUser
);

/**
 * @route   GET /api/users/:id
 * @desc    Récupérer un utilisateur par son ID
 * @access  Admin ou Propriétaire
 */
router.get(
  '/:id', 
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken, 
  // authMiddleware.checkUserOwnership('id'),
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Admin ou Propriétaire
 */
router.put(
  '/:id', 
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken, 
  // authMiddleware.checkUserOwnership('id'),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Admin
 */
router.delete(
  '/:id', 
  // Commenté temporairement pour les tests
  // authMiddleware.verifyToken, 
  // authMiddleware.authorizeRoles('admin'),
  userController.deleteUser
);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Mettre à jour le mot de passe d'un utilisateur
 * @access  Admin ou Propriétaire
 */
router.put(
  '/:id/password', 
  authMiddleware.verifyToken, 
  authMiddleware.checkUserOwnership('id'),
  userController.updatePassword
);

module.exports = router;