// backend/routes/auth.js
const express = require('express');
const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcrypt'); // Pour le hachage des mots de passe
const jwt = require('jsonwebtoken'); // Pour gérer les tokens d'authentification
const router = express.Router();

// Route pour l'inscription (signup)
router.post('/register', async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    
    // Vérifier que toutes les données requises sont présentes
    if (!req.body.nom || !req.body.prenom || !req.body.email || !req.body.password) {
      return res.status(400).json({ 
        message: 'Données manquantes', 
        details: 'Les champs nom, prenom, email et password sont obligatoires' 
      });
    }

    // Vérifier si l'email existe déjà
    const emailExists = await Utilisateur.findOne({ email: req.body.email });
    if (emailExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Créer un nouvel utilisateur
    const utilisateur = new Utilisateur({
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      motDePasse: hashedPassword,
      role: req.body.role || 'etudiant' // Par défaut, c'est un étudiant
    });

    const savedUser = await utilisateur.save();
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'votre_clé_secrète',
      { expiresIn: '1h' }
    );

    // Ne pas renvoyer le mot de passe
    const userResponse = {
      id: savedUser._id,
      nom: savedUser.nom,
      prenom: savedUser.prenom,
      email: savedUser.email,
      role: savedUser.role,
      token: token,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      message: 'Une erreur est survenue lors de l\'inscription',
      details: error.message 
    });
  }
});

// Route pour la connexion (login)
router.post('/login', async (req, res) => {
  try {
    // Rechercher l'utilisateur par email
    const utilisateur = await Utilisateur.findOne({ email: req.body.email });
    if (!utilisateur) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe avec bcrypt
    const validPassword = await bcrypt.compare(req.body.password, utilisateur.motDePasse);
    if (!validPassword) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { id: utilisateur._id, role: utilisateur.role },
      process.env.JWT_SECRET || 'votre_clé_secrète',
      { expiresIn: '1h' }
    );

    // Créer un objet utilisateur sans le mot de passe
    const userResponse = {
      id: utilisateur._id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role,
      token: token,
      createdAt: utilisateur.createdAt,
      updatedAt: utilisateur.updatedAt
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la connexion', details: error.message });
  }
});

module.exports = router;
