/**
 * Script pour créer un cours de test avec courseNumber = 1
 * Ce script permet de tester l'accès aux cours avec des IDs simples
 */

const mongoose = require('mongoose');
const Course = require('../models/course.model');
const Subject = require('../models/subject.model');
const config = require('../config/config');
const fs = require('fs');
const path = require('path');

// Connexion à MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1);
  });

async function createTestCourse() {
  try {
    // Vérifier si un cours avec courseNumber = 1 existe déjà
    const existingCourse = await Course.findOne({ courseNumber: 1 });
    if (existingCourse) {
      console.log('Un cours avec courseNumber = 1 existe déjà:');
      console.log('ID:', existingCourse._id);
      console.log('Titre:', existingCourse.title);
      console.log('PDF URL:', existingCourse.coursePdfUrl);
      mongoose.disconnect();
      return;
    }

    // Rechercher une matière existante ou en créer une nouvelle
    let subject = await Subject.findOne();
    if (!subject) {
      console.log('Aucune matière trouvée, création d\'une matière de test...');
      subject = new Subject({
        nomMatiere: 'Matière Test',
        description: 'Une matière de test pour nos cours'
      });
      await subject.save();
      console.log('Matière créée:', subject._id);
    }

    // Créer un PDF de test si nécessaire
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'courses');
    const pdfPath = path.join(uploadDir, 'test-course.pdf');
    
    // S'assurer que le répertoire existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Répertoire de téléchargement créé:', uploadDir);
    }
    
    // Si le PDF n'existe pas, créer un fichier texte simple en guise de test
    if (!fs.existsSync(pdfPath)) {
      fs.writeFileSync(
        pdfPath, 
        'Ceci est un fichier de test pour simuler un PDF de cours.'
      );
      console.log('Fichier de test créé:', pdfPath);
    }

    // Créer un cours de test
    const testCourse = new Course({
      courseNumber: 1,
      title: 'Cours de Test',
      description: 'Un cours de test pour vérifier l\'accès par ID simple',
      subject: subject._id,
      content: 'Contenu du cours de test',
      coursePdfUrl: 'uploads/courses/test-course.pdf',
      order: 1
    });

    await testCourse.save();
    console.log('Cours de test créé avec succès:');
    console.log('ID:', testCourse._id);
    console.log('Numéro:', testCourse.courseNumber);
    console.log('Titre:', testCourse.title);
    
    // Vérifier les résultats
    const courses = await Course.find().sort({ courseNumber: 1 });
    console.log(`\nTotal des cours dans la base de données: ${courses.length}`);
    console.table(courses.map(c => ({
      id: c._id.toString(),
      number: c.courseNumber,
      title: c.title,
      pdfUrl: c.coursePdfUrl
    })));

    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating test course:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

createTestCourse();
