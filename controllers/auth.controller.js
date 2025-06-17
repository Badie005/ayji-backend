const { User, Admin, Student } = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * @desc    Inscrire un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    console.log('Données d\'inscription reçues:', req.body);
    const { nom, prenom, email, password, role } = req.body;
    
    console.log('Après déstructuration:', { nom, prenom, email, password, role });
    
    // Vérifier si l'email existe déjà
    try {
      const existingUser = await User.findOne({ email });
      console.log('Utilisateur existant:', existingUser);
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }
    } catch (findError) {
      console.error('Erreur lors de la recherche d\'utilisateur existant:', findError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de l\'email',
        error: findError.message
      });
    }
    
    // Vérifier que tous les champs requis sont présents
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }
    
    // Créer un nouvel utilisateur avec son profil correspondant
    const userData = {
      nom,
      prenom,
      email,
      motDePasse: password, // Convertir password en motDePasse pour le modèle
      role: role || 'etudiant' // Par défaut, l'utilisateur est un étudiant
    };
    
    console.log('Données utilisateur avant création:', userData);
    
    try {
      const user = await User.createUserWithProfile(userData);
      console.log('Utilisateur créé avec succès:', user);
      
      // Générer un token JWT
      const token = jwt.sign(
        { userId: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE || '1d' }
      );
      
      // Retourner l'utilisateur sans le mot de passe
      const userToReturn = user.toJSON();
      
      // Ajouter le token à la réponse
      userToReturn.token = token;
      
      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: userToReturn
      });
    } catch (createError) {
      console.error('Erreur détaillée lors de la création de l\'utilisateur:', createError);
      console.error('Stack trace:', createError.stack);
      
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la création de l\'utilisateur', 
        error: createError.message
      });
    }
  } catch (error) {
    console.error('Erreur globale lors de l\'inscription:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'inscription', 
      error: error.message
    });
  }
};

/**
 * @desc    Créer un utilisateur administrateur (réservé aux administrateurs)
 * @route   POST /api/auth/register-admin
 * @access  Admin
 */
exports.registerAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, password, droits } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    // Créer un nouvel utilisateur avec le profil admin
    const userData = {
      nom,
      prenom,
      email,
      motDePasse: password, // Convertir password en motDePasse pour le modèle
      role: 'admin',
      droits: droits || 'standard'
    };
    
    const user = await User.createUserWithProfile(userData);
    
    // Retourner l'utilisateur sans le mot de passe
    const userToReturn = user.toJSON();
    
    res.status(201).json({
      success: true,
      message: 'Administrateur créé avec succès',
      data: userToReturn
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de l\'administrateur', 
      error: error.message 
    });
  }
};

/**
 * @desc    Connecter un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }
    
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Mettre à jour la dernière connexion
    const userInstance = await User.findById(user._id);
    await userInstance.updateLastLogin();
    
    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );
    
    // Préparer l'utilisateur à retourner
    const userToReturn = {
      _id: user._id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      token: token,
      isAuthenticated: true,
      lastLogin: new Date()
    };
    
    // Pour les administrateurs ou étudiants, ajouter des informations supplémentaires
    if (user.role === 'admin') {
      const adminInfo = await Admin.findOne({ idUtilisateur: user._id });
      if (adminInfo) {
        userToReturn.droits = adminInfo.droits;
      }
    } else if (user.role === 'etudiant') {
      const studentInfo = await Student.findOne({ idUtilisateur: user._id });
      if (studentInfo) {
        userToReturn.anneeScolaire = studentInfo.anneeScolaire;
        userToReturn.filiere = studentInfo.filiere;
      }
    }
    
    console.log('Informations de connexion envoyées:', userToReturn);
    
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: userToReturn
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la connexion:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la connexion', 
      error: error.message 
    });
  }
};

/**
 * @desc    Vérifier le token et récupérer les informations de l'utilisateur courant
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // L'utilisateur est déjà vérifié par le middleware verifyToken
    const user = req.user;
    
    // Pour les administrateurs, récupérer les informations supplémentaires
    let additionalInfo = {};
    
    if (user.role === 'admin') {
      const adminInfo = await Admin.findOne({ idUtilisateur: user._id });
      if (adminInfo) {
        additionalInfo = { 
          droits: adminInfo.droits 
        };
      }
    } else if (user.role === 'etudiant') {
      const studentInfo = await Student.findOne({ idUtilisateur: user._id });
      if (studentInfo) {
        additionalInfo = { 
          dateInscription: studentInfo.dateInscription,
          derniereConnexion: studentInfo.derniereConnexion
        };
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        ...additionalInfo
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des informations utilisateur', 
      error: error.message 
    });
  }
};