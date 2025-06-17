const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

/**
 * Middleware pour vérifier le token JWT et authentifier l'utilisateur
 */
exports.verifyToken = async (req, res, next) => {
  try {
    let token;
    
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    // Vérifier si le header Authorization existe et commence par "Bearer"
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1]; // Récupérer le token après "Bearer "
    } else if (req.cookies && req.cookies.token) {
      // Alternative : récupérer le token depuis les cookies
      token = req.cookies.token;
    }
    
    // Vérifier si le token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Aucun token fourni.'
      });
    }
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Trouver l'utilisateur correspondant à l'ID dans le token
    const user = await User.findById(decoded.userId);
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Utilisateur non trouvé.'
      });
    }
    
    // Ajouter l'utilisateur à la requête pour une utilisation ultérieure
    req.user = user;
    
    // Continuer avec la requête
    next();
  } catch (error) {
    // Gérer les erreurs spécifiques aux tokens JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré. Veuillez vous reconnecter.'
      });
    }
    
    // Autres erreurs
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification.',
      error: error.message
    });
  }
};

/**
 * Middleware pour restreindre l'accès en fonction du rôle
 * @param {string[]} roles - Tableau des rôles autorisés
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Vérifier si l'utilisateur existe (doit être appelé après verifyToken)
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Erreur: Utilisateur non authentifié.'
      });
    }
    
    // Vérifier si le rôle de l'utilisateur est inclus dans les rôles autorisés
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`
      });
    }
    
    // Si le rôle est autorisé, continuer
    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur a accès à ses propres ressources
 * ou qu'il est administrateur
 * @param {string} paramName - Nom du paramètre contenant l'ID utilisateur
 */
exports.checkUserOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    // Vérifier si l'utilisateur existe (doit être appelé après verifyToken)
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Erreur: Utilisateur non authentifié.'
      });
    }
    
    // Les administrateurs ont un accès complet
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Pour les non-administrateurs, vérifier si la ressource leur appartient
    const resourceUserId = req.params[paramName];
    
    // Si l'ID de la ressource correspond à l'ID de l'utilisateur, autoriser l'accès
    if (resourceUserId && resourceUserId === req.user._id.toString()) {
      return next();
    }
    
    // Sinon, refuser l'accès
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé à cette ressource.'
    });
  };
};