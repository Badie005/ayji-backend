const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/course.model');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

async function updateCourseNumbers() {
  try {
    // Les titres des cours dans l'ordre
    const courseTitles = {
      'Introduction aux réseaux informatiques': 1,
      'OSI_VE+': 2,
      'Techniques d\'adressage d\'un réseau local': 3,
      'Service DHCP': 4,
      'Service DNS': 5,
      'Services WEB': 6
    };

    // Mettre à jour chaque cours
    for (const [title, number] of Object.entries(courseTitles)) {
      const course = await Course.findOne({ title });
      if (course) {
        course.courseNumber = number;
        await course.save();
        console.log(`Cours "${title}" mis à jour avec le numéro ${number}`);
      } else {
        console.log(`Cours "${title}" non trouvé`);
      }
    }

    console.log('Mise à jour terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

updateCourseNumbers();
