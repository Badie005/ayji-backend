const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schéma principal pour les utilisateurs (collection "utilisateurs")
const userSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: [true, 'Le nom est requis'] 
  },
  prenom: { 
    type: String, 
    required: [true, 'Le prénom est requis'] 
  },
  email: { 
    type: String, 
    required: [true, 'L\'email est requis'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
  },
  motDePasse: { 
    type: String, 
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: { 
    type: String, 
    enum: ['admin', 'etudiant'], 
    default: 'etudiant' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.motDePasse);
  } catch (error) {
    throw new Error(error);
  }
};

// Middleware pour hasher le mot de passe avant l'enregistrement
userSchema.pre('save', async function(next) {
  // Ne hacher le mot de passe que s'il a été modifié (ou est nouveau)
  if (!this.isModified('motDePasse')) return next();
  
  try {
    // Générer un sel avec un facteur de coût de 10
    const salt = await bcrypt.genSalt(10);
    
    // Remplacer le mot de passe en clair par le hash
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour empêcher le renvoi du mot de passe dans les réponses
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.motDePasse;
  return userObject;
};

// Schéma pour les administrateurs (collection "admins")
const adminSchema = new mongoose.Schema({
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  droits: {
    type: String,
    default: 'standard'
  }
}, {
  timestamps: true
});

// Schéma pour les étudiants (collection "etudiants")
const studentSchema = new mongoose.Schema({
  idUtilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateInscription: {
    type: Date,
    default: Date.now
  },
  derniereConnexion: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Méthode statique pour créer un utilisateur avec son profil spécifique (admin ou étudiant)
userSchema.statics.createUserWithProfile = async function(userData) {
  console.log('Création d\'un utilisateur avec profil, données reçues:', userData);
  
  try {
    // Première étape : créer l'utilisateur principal
    const user = new this({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email,
      motDePasse: userData.motDePasse,
      role: userData.role || 'etudiant'
    });
    
    console.log('Utilisateur créé, avant sauvegarde:', user);
    
    // Sauvegarder l'utilisateur pour obtenir son ID
    await user.save();
    
    console.log('Utilisateur sauvegardé avec ID:', user._id);
    
    // Selon le rôle, créer le profil correspondant
    if (user.role === 'admin') {
      console.log('Création d\'un profil admin');
      const admin = new Admin({
        idUtilisateur: user._id,
        droits: userData.droits || 'standard'
      });
      await admin.save();
      console.log('Profil admin sauvegardé');
    } else if (user.role === 'etudiant') {
      console.log('Création d\'un profil étudiant');
      const student = new Student({
        idUtilisateur: user._id,
        dateInscription: new Date()
      });
      await student.save();
      console.log('Profil étudiant sauvegardé');
    }
    
    return user;
  } catch (error) {
    console.error('Erreur dans createUserWithProfile:', error);
    throw error;
  }
};

// Méthode pour mettre à jour la dernière connexion d'un étudiant
userSchema.methods.updateLastLogin = async function() {
  if (this.role === 'etudiant') {
    await Student.findOneAndUpdate(
      { idUtilisateur: this._id },
      { derniereConnexion: new Date() }
    );
  }
};

// Créer les modèles à partir des schémas
const User = mongoose.model('User', userSchema, 'utilisateurs');
const Admin = mongoose.model('Admin', adminSchema, 'admins');
const Student = mongoose.model('Student', studentSchema, 'etudiants');

module.exports = { User, Admin, Student };