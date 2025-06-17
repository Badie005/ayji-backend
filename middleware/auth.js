// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token JWT et authentifier l'utilisateur
const verifyToken = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).json({ message: 'Accès refusé' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'votre_clé_secrète');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token invalide' });
  }
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Droits d\'administrateur requis.' });
  }
};

// Middleware pour vérifier si l'utilisateur est un étudiant
const isEtudiant = (req, res, next) => {
  if (req.user && req.user.role === 'etudiant') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Droits d\'étudiant requis.' });
  }
};

module.exports = { verifyToken, isAdmin, isEtudiant };