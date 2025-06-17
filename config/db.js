const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
    
    // Initialisation des fonctions MongoDB si la base de données est vide
    await initializeDatabaseFunctions(conn.connection.db);
    
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Fonction pour initialiser les fonctions de la base de données
const initializeDatabaseFunctions = async (db) => {
  try {
    // Vérifier si la collection functions existe déjà
    const collections = await db.listCollections({ name: 'functions' }).toArray();
    
    if (collections.length === 0) {
      console.log('Initialisation des fonctions de la base de données...');
      
      // Création des collections et validation des schémas
      await initializeCollections(db);
      
      // Création des indexes
      await createIndexes(db);
      
      // Création des fonctions utilitaires
      await createUtilityFunctions(db);
      
      console.log('Base de données initialisée avec succès');
    } else {
      console.log('Les fonctions de la base de données sont déjà initialisées');
    }
  } catch (error) {
    console.error(`Erreur lors de l'initialisation de la base de données: ${error.message}`);
  }
};

// Fonction pour initialiser les collections et la validation des schémas
const initializeCollections = async (db) => {
  try {
    // Collection Utilisateur
    await db.createCollection("utilisateurs", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["nom", "prenom", "email", "motDePasse", "role"],
          properties: {
            nom: { bsonType: "string" },
            prenom: { bsonType: "string" },
            email: { bsonType: "string" },
            motDePasse: { bsonType: "string" },
            role: { enum: ["admin", "etudiant"] }
          }
        }
      }
    });

    // Collection Admin (héritage de Utilisateur)
    await db.createCollection("admins", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["idUtilisateur", "droits"],
          properties: {
            idUtilisateur: { bsonType: "objectId" },
            droits: { bsonType: "string" }
          }
        }
      }
    });

    // Collection Etudiant (héritage de Utilisateur)
    await db.createCollection("etudiants", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["idUtilisateur", "dateInscription"],
          properties: {
            idUtilisateur: { bsonType: "objectId" },
            dateInscription: { bsonType: "date" },
            derniereConnexion: { bsonType: "date" }
          }
        }
      }
    });

    // Collection Matière
    await db.createCollection("matieres", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["nomMatiere"],
          properties: {
            nomMatiere: { bsonType: "string" }
          }
        }
      }
    });

    // Collection Cours
    await db.createCollection("cours", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["titre", "dateCreation", "dateModification", "idMatiere", "idAdmin"],
          properties: {
            titre: { bsonType: "string" },
            description: { bsonType: "string" },
            cheminFichier: { bsonType: "string" },
            dateCreation: { bsonType: "date" },
            dateModification: { bsonType: "date" },
            idMatiere: { bsonType: "objectId" },
            idAdmin: { bsonType: "objectId" }
          }
        }
      }
    });

    // Collection Exercice
    await db.createCollection("exercices", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["titre", "difficulte", "dateCreation", "idCours", "idAdmin"],
          properties: {
            titre: { bsonType: "string" },
            description: { bsonType: "string" },
            difficulte: { enum: ["Facile", "Moyen", "Difficile"] },
            dateCreation: { bsonType: "date" },
            idCours: { bsonType: "objectId" },
            idAdmin: { bsonType: "objectId" }
          }
        }
      }
    });

    // Collection QCM
    await db.createCollection("qcms", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["titre", "dateCreation", "idCours", "idAdmin"],
          properties: {
            titre: { bsonType: "string" },
            dateCreation: { bsonType: "date" },
            tempsLimite: { bsonType: "int" },
            idCours: { bsonType: "objectId" },
            idAdmin: { bsonType: "objectId" }
          }
        }
      }
    });

    // Collection Question
    await db.createCollection("questions", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["texteQuestion", "points", "type", "idQCM"],
          properties: {
            texteQuestion: { bsonType: "string" },
            points: { bsonType: "int" },
            type: { enum: ["Choix unique", "Choix multiple"] },
            idQCM: { bsonType: "objectId" }
          }
        }
      }
    });

    // Collection Option
    await db.createCollection("options", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["texteOption", "estCorrecte", "idQuestion"],
          properties: {
            texteOption: { bsonType: "string" },
            estCorrecte: { bsonType: "bool" },
            idQuestion: { bsonType: "objectId" }
          }
        }
      }
    });

    // Collection Progression
    await db.createCollection("progressions", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["idEtudiant", "idCours", "statut", "pourcentage"],
          properties: {
            idEtudiant: { bsonType: "objectId" },
            idCours: { bsonType: "objectId" },
            statut: { enum: ["Non commencé", "En cours", "Terminé"] },
            pourcentage: { bsonType: "double" },
            dernierAcces: { bsonType: "date" },
            tempsTotal: { bsonType: "int" }
          }
        }
      }
    });

    // Collection Tentative_QCM
    await db.createCollection("tentativesQCM", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["idEtudiant", "idQCM", "date", "score"],
          properties: {
            idEtudiant: { bsonType: "objectId" },
            idQCM: { bsonType: "objectId" },
            date: { bsonType: "date" },
            score: { bsonType: "double" },
            duree: { bsonType: "int" }
          }
        }
      }
    });

    // Collection Reponse
    await db.createCollection("reponses", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["idTentative", "idQuestion", "idOption"],
          properties: {
            idTentative: { bsonType: "objectId" },
            idQuestion: { bsonType: "objectId" },
            idOption: { bsonType: "objectId" }
          }
        }
      }
    });

    // Collection Fonctions
    await db.createCollection("functions");

    console.log('Collections créées avec succès');
  } catch (error) {
    console.error(`Erreur lors de la création des collections: ${error.message}`);
    throw error;
  }
};

// Fonction pour créer les index
const createIndexes = async (db) => {
  try {
    await db.collection('utilisateurs').createIndex({ "email": 1 }, { unique: true });
    await db.collection('admins').createIndex({ "idUtilisateur": 1 }, { unique: true });
    await db.collection('etudiants').createIndex({ "idUtilisateur": 1 }, { unique: true });
    await db.collection('matieres').createIndex({ "nomMatiere": 1 }, { unique: true });
    await db.collection('cours').createIndex({ "idMatiere": 1 });
    await db.collection('exercices').createIndex({ "idCours": 1 });
    await db.collection('qcms').createIndex({ "idCours": 1 });
    await db.collection('questions').createIndex({ "idQCM": 1 });
    await db.collection('options').createIndex({ "idQuestion": 1 });
    await db.collection('progressions').createIndex({ "idEtudiant": 1, "idCours": 1 }, { unique: true });
    await db.collection('progressions').createIndex({ "idEtudiant": 1 });
    await db.collection('progressions').createIndex({ "idCours": 1 });
    await db.collection('tentativesQCM').createIndex({ "idEtudiant": 1 });
    await db.collection('tentativesQCM').createIndex({ "idQCM": 1 });
    await db.collection('reponses').createIndex({ "idTentative": 1 });

    console.log('Index créés avec succès');
  } catch (error) {
    console.error(`Erreur lors de la création des index: ${error.message}`);
    throw error;
  }
};

// Fonction pour créer les fonctions utilitaires
const createUtilityFunctions = async (db) => {
  try {
    const functionCollection = db.collection('functions');

    // Fonction pour mettre à jour la date de modification d'un cours
    await functionCollection.insertOne({
      name: "updateCoursDateModification",
      code: `
      function updateCoursDateModification(coursId) {
        db.cours.updateOne(
          { _id: coursId },
          { $set: { dateModification: new Date() } }
        );
      }
      `
    });

    // Fonction pour calculer le score d'une tentative QCM
    await functionCollection.insertOne({
      name: "calculateQCMScore",
      code: `
      function calculateQCMScore(tentativeId) {
        const tentative = db.tentativesQCM.findOne({ _id: tentativeId });
        if (!tentative) return;
        
        const reponses = db.reponses.find({ idTentative: tentativeId }).toArray();
        let totalPoints = 0;
        let earnedPoints = 0;
        
        for (const reponse of reponses) {
          const question = db.questions.findOne({ _id: reponse.idQuestion });
          if (question) {
            totalPoints += question.points;
            const option = db.options.findOne({ _id: reponse.idOption });
            if (option && option.estCorrecte) {
              earnedPoints += question.points;
            }
          }
        }
        
        // Mise à jour du score
        if (totalPoints > 0) {
          const scorePercentage = (earnedPoints / totalPoints) * 100;
          db.tentativesQCM.updateOne(
            { _id: tentativeId },
            { $set: { score: scorePercentage } }
          );
        }
      }
      `
    });

    // Fonction pour mettre à jour la dernière connexion d'un étudiant
    await functionCollection.insertOne({
      name: "updateDerniereConnexion",
      code: `
      function updateDerniereConnexion(etudiantId) {
        db.etudiants.updateOne(
          { _id: etudiantId },
          { $set: { derniereConnexion: new Date() } }
        );
      }
      `
    });

    // Fonction pour créer automatiquement des progressions pour chaque étudiant lors de l'ajout d'un cours
    await functionCollection.insertOne({
      name: "createProgressionsForNewCourse",
      code: `
      function createProgressionsForNewCourse(courseId) {
        const students = db.etudiants.find().toArray();
        
        const progressions = students.map(student => ({
          idEtudiant: student._id,
          idCours: courseId,
          statut: "Non commencé",
          pourcentage: 0,
          dernierAcces: null,
          tempsTotal: 0
        }));
        
        if (progressions.length > 0) {
          db.progressions.insertMany(progressions);
        }
      }
      `
    });

    console.log('Fonctions utilitaires créées avec succès');
  } catch (error) {
    console.error(`Erreur lors de la création des fonctions utilitaires: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;