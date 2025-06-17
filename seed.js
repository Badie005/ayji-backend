// backend/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const User = require('./models/user.model');
const Subject = require('./models/subject.model');
const Course = require('./models/course.model');
const Progression = require('./models/progression.model');

// Configuration de la connexion à MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB établie pour le seeding'))
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

// Fonction pour supprimer les données existantes
const clearDatabase = async () => {
  // Ensure the database connection is established
  await mongoose.connection.once('open', async () => {
    try {
      await User.deleteMany({});
      await Subject.deleteMany({});
      await Course.deleteMany({});
      await Progression.deleteMany({});
      console.log('Base de données vidée avec succès');
    } catch (error) {
      console.error('Erreur lors du nettoyage de la base de données:', error);
      process.exit(1);
    }
  });
};

// Fonction pour créer les données
const seedDatabase = async () => {
  try {
    // Création d'un utilisateur
    const hashedPassword = await bcrypt.hash('123456782005aA@', 12);
    const user = await User.create({
      nom: 'Khoubiza',
      prenom: 'Abdelbadie',
      email: 'badiekhoubiza05@gmail.com',
      password: hashedPassword,
      role: 'user'
    });
    console.log('Utilisateur créé:', user.email);

    // Création d'une matière
    const subject = await Subject.create({
      title: 'Systèmes Réseaux',
      description: 'Cours complet sur les systèmes et réseaux informatiques'
    });
    console.log('Matière créée:', subject.title);

    // Création des cours
    const courses = await Course.create([
      {
        title: 'Introduction aux réseaux informatiques',
        description: 'Découvrez les bases des réseaux informatiques',
        subject: subject._id,
        content: 'Contenu du cours sur les bases des réseaux',
        coursePdfUrl: '/assets/pdfs/chapitre1.pdf',
        exercisePdfUrl: '/assets/pdfs/exercices1.pdf',
        qcmPdfUrl: '/assets/pdfs/qcm1.pdf',
        order: 1
      },
      {
        title: 'Modèle OSI et Architectures de Réseau',
        description: 'Comprendre le modèle OSI et les architectures réseau',
        subject: subject._id,
        content: 'Contenu du cours sur le modèle OSI',
        coursePdfUrl: '/assets/pdfs/chapitre2.pdf',
        exercisePdfUrl: '/assets/pdfs/exercices2.pdf',
        qcmPdfUrl: '/assets/pdfs/qcm2.pdf',
        order: 2
      },
      {
        title: 'Techniques d\'adressage d\'un réseau local',
        description: 'Apprendre les techniques d\'adressage IP et sous-réseaux',
        subject: subject._id,
        content: 'Contenu du cours sur les techniques d\'adressage',
        coursePdfUrl: '/assets/pdfs/chapitre3.pdf',
        exercisePdfUrl: '/assets/pdfs/exercices3.pdf',
        qcmPdfUrl: '/assets/pdfs/qcm3.pdf',
        order: 3
      }
    ]);
    console.log(`${courses.length} cours créés`);

    // Création des progressions
    const progressions = await Progression.create([
      {
        user: user._id,
        course: courses[0]._id,
        progress: 80,
        completed: false,
        lastAccessed: new Date()
      },
      {
        user: user._id,
        course: courses[1]._id,
        progress: 30,
        completed: false,
        lastAccessed: new Date()
      },
      {
        user: user._id,
        course: courses[2]._id,
        progress: 50,
        completed: false,
        lastAccessed: new Date()
      }
    ]);
    console.log(`${progressions.length} progressions créées`);

    console.log('Seeding terminé avec succès!');
    
    // Statistiques
    const userCount = await User.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const courseCount = await Course.countDocuments();
    const progressionCount = await Progression.countDocuments();
    
    console.log('Résumé:');
    console.log(`- Utilisateurs: ${userCount}`);
    console.log(`- Matières: ${subjectCount}`);
    console.log(`- Cours: ${courseCount}`);
    console.log(`- Progressions: ${progressionCount}`);
    
    // Fermer la connexion à MongoDB
    mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
    
  } catch (error) {
    console.error('Erreur lors du seeding de la base de données:', error);
    process.exit(1);
  }
};

// Exécution du processus de seeding
(async () => {
  console.log('Début du processus de seeding...');
  await clearDatabase();
  await seedDatabase();
})();