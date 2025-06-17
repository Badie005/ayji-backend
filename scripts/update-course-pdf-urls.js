/**
 * Script pour mettre à jour les URLs des PDFs des cours
 * Pour corriger le problème d'accès aux fichiers PDF
 */

const mongoose = require('mongoose');
const Course = require('../models/course.model');
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

async function updateCoursePdfUrls() {
  try {
    // Dossier où sont stockés les PDFs
    const pdfDir = path.join(__dirname, '..', 'public', 'uploads', 'courses');
    
    // Récupérer la liste des fichiers PDF disponibles
    const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
    console.log('Fichiers PDF disponibles:', pdfFiles);
    
    // Récupérer tous les cours
    const courses = await Course.find();
    console.log(`Trouvé ${courses.length} cours à vérifier`);
    
    let updatedCount = 0;
    
    // Pour chaque cours
    for (const course of courses) {
      // Afficher l'URL actuelle
      console.log(`Cours: ${course.title}`);
      console.log(`  URL actuelle: ${course.coursePdfUrl}`);
      
      // Extraire le nom du fichier de l'URL actuelle
      const currentFilename = path.basename(course.coursePdfUrl || '');
      
      // Si l'URL pointe vers un fichier qui n'existe pas
      if (currentFilename && !pdfFiles.includes(currentFilename)) {
        // Chercher un fichier similaire
        const possibleMatch = pdfFiles.find(file => {
          // Chercher par numéro ou par mots-clés dans le nom du fichier
          const fileWords = file.toLowerCase().replace(/[_\-\.]/g, ' ');
          const urlWords = currentFilename.toLowerCase().replace(/[_\-\.]/g, ' ');
          
          // Si le fichier contient "introduction" et "reseau", c'est probablement le bon pour le premier chapitre
          if (file.includes('1_') && currentFilename.includes('Introduction')) {
            return true;
          }
          
          return fileWords.includes(urlWords) || urlWords.includes(fileWords);
        });
        
        if (possibleMatch) {
          // Mettre à jour l'URL du cours
          const newUrl = `uploads/courses/${possibleMatch}`;
          console.log(`  Correspondance possible trouvée: ${possibleMatch}`);
          console.log(`  Mise à jour de l'URL: ${newUrl}`);
          
          await Course.findByIdAndUpdate(
            course._id,
            { coursePdfUrl: newUrl },
            { new: true }
          );
          
          updatedCount++;
        } else {
          console.log(`  Aucune correspondance trouvée pour ${currentFilename}`);
        }
      } else if (!currentFilename) {
        console.log(`  Pas d'URL de PDF définie pour ce cours`);
      } else {
        console.log(`  Le fichier existe déjà, aucune mise à jour nécessaire`);
      }
      
      console.log('-------------------');
    }
    
    console.log(`Mise à jour terminée. ${updatedCount} cours mis à jour.`);
    
    // Afficher les URLs mises à jour
    const updatedCourses = await Course.find().select('_id title coursePdfUrl');
    console.table(updatedCourses.map(c => ({
      id: c._id.toString(),
      title: c.title,
      pdfUrl: c.coursePdfUrl
    })));
    
    mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des URLs:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

updateCoursePdfUrls();
