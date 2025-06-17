/**
 * Script pour réparer la base de données MongoDB
 * Fusionne les collections 'cours' et 'courses' en une seule collection
 */

const mongoose = require('mongoose');
const Course = require('../models/course.model');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// URI de connexion MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/plateforme_apprentissage';

async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connexion à MongoDB établie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
}

async function fixDatabase() {
  try {
    console.log('🔄 Début de la réparation de la base de données...');
    
    // 1. Obtenir une référence directe à la base de données
    const db = mongoose.connection.db;
    
    // 2. Vérifier si les deux collections existent
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📋 Collections trouvées:', collectionNames.join(', '));
    
    const coursExists = collectionNames.includes('cours');
    const coursesExists = collectionNames.includes('courses');
    
    if (!coursExists && !coursesExists) {
      console.log('⚠️ Aucune collection de cours trouvée. Rien à faire.');
      return;
    }
    
    if (coursExists && !coursesExists) {
      console.log('🔄 Collection "cours" trouvée mais pas "courses". Renommage en cours...');
      await db.collection('cours').rename('courses');
      console.log('✅ Collection "cours" renommée en "courses"');
      return;
    }
    
    if (!coursExists && coursesExists) {
      console.log('✅ Seule la collection "courses" existe. Aucune action nécessaire.');
      return;
    }
    
    // 3. Si les deux collections existent, fusionner leurs données
    console.log('🔄 Les deux collections existent. Fusion en cours...');
    
    // Récupérer tous les documents de 'cours'
    const coursDocs = await db.collection('cours').find({}).toArray();
    console.log(`📋 ${coursDocs.length} documents trouvés dans la collection 'cours'`);
    
    if (coursDocs.length > 0) {
      // Pour chaque document dans 'cours', vérifier s'il existe déjà dans 'courses'
      for (const doc of coursDocs) {
        const existingDoc = await db.collection('courses').findOne({ _id: doc._id });
        
        if (!existingDoc) {
          // Si le document n'existe pas, l'insérer dans 'courses'
          await db.collection('courses').insertOne(doc);
          console.log(`✅ Document '${doc.title || doc._id}' inséré dans 'courses'`);
        } else {
          console.log(`⏩ Document '${doc.title || doc._id}' existe déjà dans 'courses'`);
        }
      }
    }
    
    // 4. Supprimer l'ancienne collection
    await db.collection('cours').drop();
    console.log('🗑️ Collection "cours" supprimée');
    
    console.log('✅ Réparation de la base de données terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la réparation de la base de données:', error);
  }
}

async function main() {
  await connectToMongoDB();
  await fixDatabase();
  
  // Fermer la connexion
  console.log('👋 Fermeture de la connexion MongoDB');
  await mongoose.connection.close();
  
  process.exit(0);
}

// Exécuter le script
main();
