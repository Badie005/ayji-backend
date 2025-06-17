// backend/routes/utilisateurs.js
const express = require('express');
const Utilisateur = require('../models/Utilisateur');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Importation des middlewares d'authentification
const bcrypt = require('bcrypt');
const router = express.Router();

// Route pour récupérer tous les utilisateurs (admin seulement)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find().select('-motDePasse'); // Ne pas renvoyer les mots de passe
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour récupérer un utilisateur spécifique par ID (admin seulement)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id).select('-motDePasse');
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour ajouter un utilisateur (admin seulement)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const emailExists = await Utilisateur.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.motDePasse, salt);

    const utilisateur = new Utilisateur({
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      motDePasse: hashedPassword,
      role: req.body.role || 'etudiant' // Par défaut, c'est un étudiant
    });

    const newUtilisateur = await utilisateur.save();
    // Ne pas renvoyer le mot de passe
    const userResponse = {
      id: newUtilisateur._id,
      nom: newUtilisateur.nom,
      prenom: newUtilisateur.prenom,
      email: newUtilisateur.email,
      role: newUtilisateur.role,
      createdAt: newUtilisateur.createdAt,
      updatedAt: newUtilisateur.updatedAt
    };
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour mettre à jour un utilisateur (admin seulement)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (req.body.email && req.body.email !== utilisateur.email) {
      const emailExists = await Utilisateur.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      nom: req.body.nom || utilisateur.nom,
      prenom: req.body.prenom || utilisateur.prenom,
      email: req.body.email || utilisateur.email,
      role: req.body.role || utilisateur.role
    };

    // Si un nouveau mot de passe est fourni, le hacher
    if (req.body.motDePasse) {
      const salt = await bcrypt.genSalt(10);
      updateData.motDePasse = await bcrypt.hash(req.body.motDePasse, salt);
    }

    const updatedUser = await Utilisateur.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-motDePasse');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour supprimer un utilisateur (admin seulement)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Vérifier que l'administrateur n'essaie pas de se supprimer lui-même
    if (utilisateur._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await Utilisateur.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
