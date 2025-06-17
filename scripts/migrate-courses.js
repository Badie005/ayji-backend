/**
 * Script de migration pour ajouter des courseNumber aux cours existants
 * 
 * Ce script attribue un numéro unique (1, 2, 3, etc.) à chaque cours existant
 * pour permettre l'accès aux cours avec des IDs simples comme /courses/1
 */

const mongoose = require('mongoose');
const Course = require('../models/course.model');
const config = require('../config/config');

// Connexion à MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1);
  });

async function migrateCourses() {
  try {
    // Récupérer tous les cours
    const courses = await Course.find().sort({ order: 1, createdAt: 1 });
    
    console.log(`Found ${courses.length} courses to migrate`);
    
    // Mettre à jour chaque cours avec un courseNumber unique
    for (let i = 0; i < courses.length; i++) {
      const courseNumber = i + 1; // Commence à 1
      
      console.log(`Setting courseNumber ${courseNumber} for course: ${courses[i].title}`);
      
      await Course.findByIdAndUpdate(
        courses[i]._id,
        { courseNumber },
        { new: true }
      );
    }
    
    console.log('Migration completed successfully!');
    
    // Vérifier les résultats
    const updatedCourses = await Course.find().sort({ courseNumber: 1 }).select('_id title courseNumber');
    console.log('Updated courses:');
    console.table(updatedCourses.map(c => ({
      id: c._id.toString(),
      title: c.title,
      courseNumber: c.courseNumber
    })));
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error during migration:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

migrateCourses();
