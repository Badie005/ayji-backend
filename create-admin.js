require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/user.model');

// Configuration de connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connexion à MongoDB établie');
    console.log('Base de données:', mongoose.connection.db.databaseName);
    
    try {
      // Créer un nouvel admin
      const adminData = {
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@plateforme.com',
        motDePasse: 'Admin123!',
        role: 'admin',
        droits: 'superadmin'
      };
      
      // Vérifier si l'admin existe déjà
      const existingUser = await User.findOne({ email: adminData.email });
      if (existingUser) {
        console.log('Un utilisateur avec cet email existe déjà:', existingUser.email);
        process.exit(0);
      }
      
      console.log('Création de l\'administrateur...');
      const admin = await User.createUserWithProfile(adminData);
      console.log('Administrateur créé avec succès:');
      console.log('- Nom:', admin.nom, admin.prenom);
      console.log('- Email:', admin.email);
      console.log('- Rôle:', admin.role);
      console.log('- ID:', admin._id);
      console.log('\nVous pouvez maintenant vous connecter avec:');
      console.log('Email: admin@plateforme.com');
      console.log('Mot de passe: Admin123!');
    } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
    } finally {
      // Fermer la connexion à MongoDB
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
