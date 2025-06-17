const { User, Admin, Student } = require('../models/user.model');

const bcrypt = require('bcrypt');

/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/users
 * @access  Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Récupération de tous les utilisateurs');
    // Filtrer par rôle si spécifié dans la requête
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Récupérer les utilisateurs de la base de données
    const users = await User.find(filter);
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
    console.log('Utilisateurs bruts:', JSON.stringify(users));

    // Enrichir les données utilisateurs avec les informations spécifiques aux rôles
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const userObj = user.toJSON();

      if (user.role === 'admin') {
        const adminInfo = await Admin.findOne({ idUtilisateur: user._id });
        if (adminInfo) {
          userObj.droits = adminInfo.droits;
        }
      } else if (user.role === 'etudiant') {
        const studentInfo = await Student.findOne({ idUtilisateur: user._id });
        if (studentInfo) {
          userObj.dateInscription = studentInfo.dateInscription;
          userObj.derniereConnexion = studentInfo.derniereConnexion;
        }
      }

      return userObj;
    }));

    console.log('Envoi de la réponse au frontend');
    res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      data: enrichedUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer un utilisateur par son ID
 * @route   GET /api/users/:id
 * @access  Admin ou l'utilisateur lui-même
 */
exports.getUserById = async (req, res) => {
  try {
    console.log('Récupération de l\'utilisateur par ID:', req.params.id);
    const userId = req.params.id;

    // Récupérer l'utilisateur de la base de données
    const user = await User.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      console.log('Utilisateur non trouvé pour ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    console.log('Utilisateur trouvé:', user);

    // Enrichir les données utilisateur avec les informations spécifiques au rôle
    const userObj = user.toJSON();

    if (user.role === 'admin') {
      const adminInfo = await Admin.findOne({ idUtilisateur: user._id });
      if (adminInfo) {
        userObj.droits = adminInfo.droits;
      }
    } else if (user.role === 'etudiant') {
      const studentInfo = await Student.findOne({ idUtilisateur: user._id });
      if (studentInfo) {
        userObj.dateInscription = studentInfo.dateInscription;
        userObj.derniereConnexion = studentInfo.derniereConnexion;
      }
    }

    console.log('Envoi de la réponse au frontend:', userObj);
    res.status(200).json({
      success: true,
      data: userObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * @desc    Créer un nouvel utilisateur (par l'administrateur)
 * @route   POST /api/users
 * @access  Admin
 */
exports.createUser = async (req, res) => {
  try {
    console.log('Données reçues pour création utilisateur:', req.body);
    const { nom, prenom, email, password, role } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email déjà utilisé:', email);
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Créer un nouvel utilisateur
    const user = new User({
      nom,
      prenom,
      email,
      motDePasse: password, 
      role: role || 'etudiant'
    });
    
    console.log('Utilisateur avant sauvegarde:', user);
    // Pas besoin de hasher manuellement, le middleware pre-save du modèle s'en charge
    
    await user.save();
    console.log('Utilisateur créé avec succès, ID:', user._id);
    
    // Créer le profil spécifique au rôle
    try {
      if (role === 'admin') {
        console.log('Création du profil admin pour ID:', user._id);
        const admin = new Admin({
          idUtilisateur: user._id,
          droits: 'standard'
        });
        await admin.save();
        console.log('Profil admin créé avec succès');
      } else if (role === 'etudiant') {
        console.log('Création du profil étudiant pour ID:', user._id);
        const student = new Student({
          idUtilisateur: user._id,
          dateInscription: new Date()
        });
        await student.save();
        console.log('Profil étudiant créé avec succès');
      }
    } catch (profileError) {
      console.error('Erreur lors de la création du profil:', profileError);
      // Continuer le processus même en cas d'erreur de profil
    }
    
    // Retourner l'utilisateur sans le mot de passe
    const userToReturn = user.toJSON();
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: userToReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un utilisateur
 * @route   PUT /api/users/:id
 * @access  Admin ou l'utilisateur lui-même
 */
exports.updateUser = async (req, res) => {
  try {
    console.log('Mise à jour de l\'utilisateur avec ID:', req.params.id);
    console.log('Données reçues pour mise à jour:', req.body);
    
    const userId = req.params.id;
    const { nom, prenom, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      console.log('Utilisateur non trouvé pour la mise à jour, ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        console.log('Email déjà utilisé par un autre utilisateur:', email);
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé par un autre utilisateur'
        });
      }
    }

    // Mettre à jour les informations de base
    user.nom = nom || user.nom;
    user.prenom = prenom || user.prenom;
    user.email = email || user.email;
    if (role) user.role = role;

    // Si un nouveau mot de passe est fourni, le hasher
    if (password) {
      console.log('Mise à jour du mot de passe');
      user.motDePasse = password; // Le middleware pre-save s'occupera du hashage
    }

    await user.save();
    console.log('Utilisateur mis à jour avec succès');

    // Mettre à jour le profil spécifique au rôle si le rôle a changé
    if (role && role !== user.role) {
      console.log('Le rôle a changé, mise à jour du profil spécifique');
      
      // Supprimer les anciens profils liés
      if (user.role === 'admin') {
        await Admin.findOneAndDelete({ idUtilisateur: user._id });
      } else if (user.role === 'etudiant') {
        await Student.findOneAndDelete({ idUtilisateur: user._id });
      }

      // Créer le nouveau profil
      if (role === 'admin') {
        const admin = new Admin({
          idUtilisateur: user._id,
          droits: 'standard'
        });
        await admin.save();
      } else if (role === 'etudiant') {
        const student = new Student({
          idUtilisateur: user._id,
          dateInscription: new Date()
        });
        await student.save();
      }
    }

    // Retourner l'utilisateur mis à jour sans le mot de passe
    const userToReturn = user.toJSON();
    
    console.log('Envoi de la réponse au frontend avec l\'utilisateur mis à jour');
    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: userToReturn
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    console.log('Tentative de suppression de l\'utilisateur avec ID:', req.params.id);
    const userId = req.params.id;
    
    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      console.log('Utilisateur non trouvé pour la suppression, ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    console.log('Utilisateur trouvé pour suppression:', user);
    
    // Supprimer le profil spécifique au rôle
    if (user.role === 'admin') {
      console.log('Suppression du profil admin associé');
      await Admin.findOneAndDelete({ idUtilisateur: user._id });
    } else if (user.role === 'etudiant') {
      console.log('Suppression du profil étudiant associé');
      await Student.findOneAndDelete({ idUtilisateur: user._id });
    }
    
    // Supprimer l'utilisateur lui-même
    console.log('Suppression de l\'utilisateur');
    await User.findByIdAndDelete(userId);
    
    console.log('Utilisateur supprimé avec succès, ID:', userId);
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour le mot de passe d'un utilisateur
 * @route   PUT /api/users/:id/password
 * @access  Admin ou l'utilisateur lui-même
 */
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Si l'utilisateur change son propre mot de passe (pas un admin), vérifier l'ancien mot de passe
    if (req.user.role !== 'admin' || req.user._id.toString() === userId) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez fournir votre mot de passe actuel'
        });
      }
      
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }
    }
    
    // Vérifier si le nouveau mot de passe est fourni
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nouveau mot de passe'
      });
    }
    
    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.motDePasse = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe',
      error: error.message
    });
  }
};