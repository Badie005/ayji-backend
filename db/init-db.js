/**
 * MongoDB Database Initialization Script
 * This script initializes the plateforme_apprentissage database with all required collections and indices
 */

// Connect to MongoDB
db = db.getSiblingDB('plateforme_apprentissage');

// Drop existing collections if needed (uncomment if you want to recreate from scratch)
// db.utilisateurs.drop();
// db.admins.drop();
// db.etudiants.drop();
// db.matieres.drop();
// db.cours.drop();
// db.exercices.drop();
// db.qcms.drop();
// db.questions.drop();
// db.options.drop();
// db.progressions.drop();
// db.tentativesQCM.drop();
// db.reponses.drop();
// db.functions.drop();

// Collection Utilisateur
db.createCollection("utilisateurs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nom", "prenom", "email", "motDePasse"],
      properties: {
        nom: { bsonType: "string" },
        prenom: { bsonType: "string" },
        email: { bsonType: "string" },
        motDePasse: { bsonType: "string" }
      }
    }
  }
});

// Collection Admin (héritage de Utilisateur)
db.createCollection("admins", {
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
db.createCollection("etudiants", {
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
db.createCollection("matieres", {
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
db.createCollection("cours", {
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
db.createCollection("exercices", {
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
db.createCollection("qcms", {
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
db.createCollection("questions", {
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
db.createCollection("options", {
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
db.createCollection("progressions", {
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
db.createCollection("tentativesQCM", {
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
db.createCollection("reponses", {
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

// Création des index
db.utilisateurs.createIndex({ "email": 1 }, { unique: true });
db.admins.createIndex({ "idUtilisateur": 1 }, { unique: true });
db.etudiants.createIndex({ "idUtilisateur": 1 }, { unique: true });
db.matieres.createIndex({ "nomMatiere": 1 }, { unique: true });
db.cours.createIndex({ "idMatiere": 1 });
db.exercices.createIndex({ "idCours": 1 });
db.qcms.createIndex({ "idCours": 1 });
db.questions.createIndex({ "idQCM": 1 });
db.options.createIndex({ "idQuestion": 1 });
db.progressions.createIndex({ "idEtudiant": 1, "idCours": 1 }, { unique: true });
db.progressions.createIndex({ "idEtudiant": 1 });
db.progressions.createIndex({ "idCours": 1 });
db.tentativesQCM.createIndex({ "idEtudiant": 1 });
db.tentativesQCM.createIndex({ "idQCM": 1 });
db.reponses.createIndex({ "idTentative": 1 });

// Fonctions utiles
db.createCollection("functions");

// Fonction pour mettre à jour la date de modification d'un cours
db.functions.insertOne({
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
db.functions.insertOne({
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
db.functions.insertOne({
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
db.functions.insertOne({
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

print("Database plateforme_apprentissage initialized successfully!");
