/**
 * Script pour importer les fichiers PDF de cours existants dans la base de données
 * 
 * Exécuter avec: node scripts/import-courses.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Chargement des variables d'environnement
dotenv.config();

// Modèle de cours (défini en ligne pour éviter les problèmes d'importation)
const courseSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre du cours est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description du cours est requise'],
    trim: true
  },
  idMatiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'La matière associée est requise']
  },
  content: {
    type: String,
    default: ''
  },
  coursePdfUrl: {
    type: String,
    default: ''
  },
  exercisePdfUrl: {
    type: String,
    default: ''
  },
  qcmPdfUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', courseSchema);

// Modèle de matière
const subjectSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la matière est requis'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description de la matière est requise'],
    trim: true
  }
});

const Subject = mongoose.model('Subject', subjectSchema);

// Chemin vers les fichiers PDF
const uploadsDir = path.join(__dirname, '../public/uploads/courses');

// Mappage entre les noms de fichiers et les cours
const coursesMapping = [
  {
    filename: '1_Introduction aux réseaux informatiques.pdf',
    titre: 'Introduction aux réseaux informatiques',
    description: 'Ce cours couvre les concepts de base des réseaux informatiques, les types de réseaux et leur fonctionnement.',
    ordre: 1
  },
  {
    filename: '2_OSI_VE+.pdf',
    titre: 'Modèle OSI et Architectures de Réseau',
    description: 'Ce cours détaille le modèle OSI à 7 couches et explique comment les différentes architectures de réseau sont organisées.',
    ordre: 2
  },
  {
    filename: '3 _Techniques d\'adressage d_un réseau local&.pdf',
    titre: 'Techniques d\'adressage d\'un réseau local',
    description: 'Ce cours explique les différentes techniques d\'adressage utilisées dans les réseaux locaux.',
    ordre: 3
  },
  {
    filename: '4_Service_DHCP.pdf',
    titre: 'Service DHCP',
    description: 'Ce cours couvre le fonctionnement du protocole DHCP (Dynamic Host Configuration Protocol) pour l\'attribution automatique d\'adresses IP.',
    ordre: 4
  },
  {
    filename: '5_Service_DNS.pdf',
    titre: 'Service DNS',
    description: 'Ce cours explique le système de noms de domaine (DNS) et son importance dans les réseaux modernes.',
    ordre: 5
  },
  {
    filename: '6_services web.pdf',
    titre: 'Services Web',
    description: 'Ce cours introduit les concepts des services web et leur rôle dans l\'architecture client-serveur.',
    ordre: 6
  }
];

// Fonction pour créer ou récupérer une matière
async function getOrCreateSubject() {
  let subject = await Subject.findOne({ nom: 'Systèmes Réseaux' });
  
  if (!subject) {
    subject = await Subject.create({
      nom: 'Systèmes Réseaux',
      description: 'Cours portant sur les systèmes et réseaux informatiques'
    });
    console.log('Matière créée:', subject);
  } else {
    console.log('Matière existante trouvée:', subject);
  }
  
  return subject;
}

// Fonction pour vérifier l'existence d'un cours
async function findExistingCourse(courseTitre) {
  const existingCourse = await Course.findOne({ 
    titre: courseTitre
  });
  
  return existingCourse;
}

// Fonction pour créer ou mettre à jour un cours
async function createOrUpdateCourse(courseData, subjectId) {
  try {
    // Vérifier si le fichier existe
    const filePath = path.join(uploadsDir, courseData.filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Attention: Le fichier ${courseData.filename} n'existe pas dans ${uploadsDir}`);
      console.log('Veuillez vérifier le chemin et le nom du fichier');
      return null;
    }
    
    // Préparer les données du cours
    const courseToSave = {
      titre: courseData.titre,
      description: courseData.description,
      idMatiere: subjectId,
      coursePdfUrl: `/uploads/courses/${courseData.filename}`,
      order: courseData.ordre
    };
    
    // Vérifier si le cours existe déjà
    const existingCourse = await findExistingCourse(courseData.titre);
    
    if (existingCourse) {
      console.log(`Le cours "${courseData.titre}" existe déjà, mise à jour...`);
      
      // Mettre à jour le cours existant
      Object.assign(existingCourse, courseToSave);
      existingCourse.dateModification = new Date();
      
      await existingCourse.save();
      console.log(`Cours "${courseData.titre}" mis à jour avec succès!`);
      return existingCourse;
    } else {
      // Créer un nouveau cours
      const newCourse = await Course.create(courseToSave);
      console.log(`Nouveau cours "${courseData.titre}" créé avec succès!`);
      return newCourse;
    }
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du cours:', error);
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/plateforme_apprentissage');
    console.log('Connecté à MongoDB!');
    
    // Créer ou récupérer la matière
    const subject = await getOrCreateSubject();
    
    // Créer ou mettre à jour chaque cours
    const createdCourses = [];
    for (const courseMap of coursesMapping) {
      const course = await createOrUpdateCourse(courseMap, subject._id);
      if (course) {
        createdCourses.push(course);
      }
    }
    
    console.log('Opération terminée avec succès!');
    console.log('Résumé:');
    console.log(`- Matière: ${subject.nom} (${subject._id})`);
    console.log(`- Nombre de cours créés/mis à jour: ${createdCourses.length}`);
    
    // Afficher les détails de chaque cours
    createdCourses.forEach((course, index) => {
      console.log(`\nCours ${index + 1}: ${course.titre}`);
      console.log(`- ID: ${course._id}`);
      console.log(`- PDF: ${course.coursePdfUrl}`);
      console.log(`- Ordre: ${course.order}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

// Exécution du script
main();
