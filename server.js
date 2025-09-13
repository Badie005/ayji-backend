const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Ajout du module fs pour les opérations de fichiers
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Gestionnaire d'erreurs global pour les promesses non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse non gérée:', reason);
  console.error('La pile d\'appel complète:', reason.stack);
});

// Gestionnaire d'erreurs global pour les exceptions
process.on('uncaughtException', (error) => {
  console.error('Exception non capturée:', error);
  console.error('La pile d\'appel complète:', error.stack);
});

// Import des routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const subjectRoutes = require('./routes/subject.routes');
const courseRoutes = require('./routes/course.routes');
const progressionRoutes = require('./routes/progression.routes');
const progressRoutes = require('./routes/progress.routes'); // Nouveau système de progression
const uploadRoutes = require('./routes/upload.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const qcmRoutes = require('./routes/qcm.routes');

// Chargement des variables d'environnement
dotenv.config();

// Création de l'application Express
const app = express();

// Définir le port
const PORT = process.env.PORT || 3000;

// Middleware pour les logs et la sécurité
app.use(morgan('dev'));
app.use(helmet({
  // Conserve le comportement actuel pour permettre le chargement des ressources cross-origin (utile en dev avec un front séparé)
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Active une politique CSP stricte et fonctionnelle
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "font-src": ["'self'", "data:"],
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src": ["'self'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'"],
      "frame-ancestors": ["'self'"],
      "upgrade-insecure-requests": []
    }
  }
  // referrerPolicy: { policy: "no-referrer" } // Optionnel: renforcer la confidentialité
}));

// Configuration CORS pour permettre l'accès depuis Angular
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());

// Middleware pour parser le body des requêtes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware pour servir les fichiers statiques AVANT toutes les autres routes
// Cela garantit que les requêtes de fichiers statiques ne sont pas interceptées par d'autres middlewares
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/qcms', qcmRoutes);
app.use('/api/progressions', progressionRoutes);
app.use('/api/progress', progressRoutes); // Nouveau système de progression
app.use('/api/uploads', uploadRoutes);

// Log des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    console.log('Request Body:', req.body);
    next();
  });
}

// Log des requêtes de fichiers statiques amélioré
app.use((req, res, next) => {
  if (req.path.includes('/uploads/')) {
    console.log(`Requête fichier statique: ${req.path}`);
    console.log(`Fichier recherché: ${path.join(__dirname, 'public', req.path)}`);
    
    // Vérifier si le fichier existe
    const filePath = path.join(__dirname, 'public', req.path);
    if (fs.existsSync(filePath)) {
      console.log(`Le fichier existe: ${filePath}`);
    } else {
      console.log(`Le fichier n'existe PAS: ${filePath}`);
      
      // Tenter de trouver des fichiers similaires pour aider au diagnostic
      const dir = path.dirname(filePath);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        console.log(`Fichiers disponibles dans ${dir}:`, files);
      }
    }
  }
  next();
});

// Route spécifique pour servir les fichiers PDF des cours
app.get('/uploads/courses/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'uploads', 'courses', filename);
  
  console.log(`Route spéciale PDF - Fichier demandé: ${filename}`);
  console.log(`Chemin complet: ${filePath}`);
  
  // Vérifier si le fichier existe
  if (fs.existsSync(filePath)) {
    console.log(`Le fichier PDF existe et sera servi: ${filePath}`);
    return res.sendFile(filePath);
  } else {
    console.log(`ERREUR: Le fichier PDF n'existe pas: ${filePath}`);
    
    // Afficher les fichiers disponibles pour aider au diagnostic
    const dir = path.dirname(filePath);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      console.log(`Fichiers disponibles dans ${dir}:`, files);
    }
    
    return res.status(404).send(`Fichier non trouvé: ${filename}`);
  }
});

// Route pour tester si l'API fonctionne
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API fonctionnelle',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs pour les routes non trouvées
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware de gestion des erreurs
app.use((error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
  });
});

// Connexion à MongoDB et démarrage du serveur
console.log('Tentative de connexion à MongoDB:', process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connexion à MongoDB établie avec succès');
    console.log('Base de données:', mongoose.connection.db.databaseName);
    console.log('Collections disponibles:');
    
    // Liste des collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        collections.forEach(collection => {
          console.log(' - ' + collection.name);
        });
      })
      .catch(err => console.error('Erreur lors de la récupération des collections:', err));
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err.message);
    console.error('Détails de l\'erreur:', err);
    process.exit(1);
  });