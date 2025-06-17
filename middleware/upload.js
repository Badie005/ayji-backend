const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/courses');
    
    // Vérifier si le répertoire existe, sinon le créer
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Créer un nom de fichier unique en combinant le timestamp et le nom d'origine
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});

// Filtrer les fichiers pour accepter uniquement les PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
  }
};

// Créer le middleware d'upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // Limite de 10 Mo
  },
  fileFilter: fileFilter
});

module.exports = upload;
