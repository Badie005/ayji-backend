const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/course.model');
const Subject = require('../models/subject.model');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

async function createCourses() {
  try {
    // Trouver ou créer la matière "Réseaux"
    let subject = await Subject.findOne({ nomMatiere: 'Réseaux' });
    if (!subject) {
      subject = await Subject.create({
        nomMatiere: 'Réseaux',
        description: 'Cours sur les réseaux informatiques'
      });
      console.log('Matière "Réseaux" créée');
    }

    // Définition des cours
    const courses = [
      {
        title: 'Introduction aux réseaux informatiques',
        description: 'Introduction aux concepts fondamentaux des réseaux',
        courseNumber: 1,
        subject: subject._id,
        coursePdfUrl: '/uploads/courses/Chapitre 1_Introduction aux réseaux informatiques.pdf',
        exercisePdfUrl: '/uploads/courses/Chapitre 1_Introduction aux réseaux informatiques.pdf',
        qcmPdfUrl: '/uploads/courses/Chapitre 1_Introduction aux réseaux informatiques.pdf'
      },
      {
        title: 'OSI_VE+',
        description: 'Le modèle OSI et ses couches',
        courseNumber: 2,
        subject: subject._id,
        coursePdfUrl: '/uploads/courses/Chapitre 2_Modèle OSI.pdf',
        exercisePdfUrl: '/uploads/courses/Chapitre 2_Modèle OSI.pdf',
        qcmPdfUrl: '/uploads/courses/Chapitre 2_Modèle OSI.pdf'
      },
      {
        title: 'Techniques d\'adressage d\'un réseau local',
        description: 'Adressage IP et sous-réseaux',
        courseNumber: 3,
        subject: subject._id,
        coursePdfUrl: '/uploads/courses/Chapitre 3_Adressage IPv4.pdf',
        exercisePdfUrl: '/uploads/courses/Chapitre 3_Adressage IPv4.pdf',
        qcmPdfUrl: '/uploads/courses/Chapitre 3_Adressage IPv4.pdf'
      },
      {
        title: 'Service DHCP',
        description: 'Configuration et gestion du service DHCP',
        courseNumber: 4,
        subject: subject._id,
        coursePdfUrl: '/uploads/courses/Chapitre 4_DHCP.pdf',
        exercisePdfUrl: '/uploads/courses/Chapitre 4_DHCP.pdf',
        qcmPdfUrl: '/uploads/courses/Chapitre 4_DHCP.pdf'
      },
      {
        title: 'Service DNS',
        description: 'Configuration et gestion du service DNS',
        courseNumber: 5,
        subject: subject._id,
        coursePdfUrl: '/uploads/courses/Chapitre 5_DNS.pdf',
        exercisePdfUrl: '/uploads/courses/Chapitre 5_DNS.pdf',
        qcmPdfUrl: '/uploads/courses/Chapitre 5_DNS.pdf'
      },
      {
        title: 'Services WEB',
        description: 'Configuration et gestion des services Web',
        courseNumber: 6,
        subject: subject._id,
        coursePdfUrl: '/uploads/courses/Chapitre 6_Services Web.pdf',
        exercisePdfUrl: '/uploads/courses/Chapitre 6_Services Web.pdf',
        qcmPdfUrl: '/uploads/courses/Chapitre 6_Services Web.pdf'
      }
    ];

    // Créer les cours
    for (const courseData of courses) {
      // Vérifier si le cours existe déjà
      const existingCourse = await Course.findOne({ courseNumber: courseData.courseNumber });
      if (existingCourse) {
        console.log(`Cours "${courseData.title}" existe déjà`);
        continue;
      }

      // Créer le nouveau cours
      const course = await Course.create(courseData);
      console.log(`Cours "${course.title}" créé avec succès`);
    }

    console.log('Création des cours terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création des cours:', error);
    process.exit(1);
  }
}

createCourses();
