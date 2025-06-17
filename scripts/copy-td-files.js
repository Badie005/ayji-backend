const fs = require('fs');
const path = require('path');

// Chemin vers le dossier contenant les PDFs
const pdfFolder = path.join(__dirname, '..', 'public', 'uploads', 'courses');

// Fichiers d'exercices mentionnés par l'utilisateur
const exerciseFiles = [
  { source: 'TD1.pdf', target: 'td1.pdf' },
  { source: 'TD1_Correction.pdf', target: 'td1_correction.pdf' },
  { source: 'TD2.pdf', target: 'td2.pdf' },
  { source: 'TD2_Correction.pdf', target: 'td2_correction.pdf' },
  { source: 'TD3_&_Correction.pdf', target: 'td3_correction.pdf' }
];

// Créer des copies des fichiers d'exercices
async function copyExerciseFiles() {
  try {
    // Vérifier si le dossier existe
    if (!fs.existsSync(pdfFolder)) {
      console.error(`Le dossier ${pdfFolder} n'existe pas`);
      return;
    }

    // Lister les fichiers dans le dossier
    const files = fs.readdirSync(pdfFolder);
    console.log(`Fichiers trouvés dans ${pdfFolder}:`, files);

    // Copier chaque fichier d'exercice
    for (const file of exerciseFiles) {
      const sourcePath = path.join(pdfFolder, file.source);
      const targetPath = path.join(pdfFolder, file.target);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Fichier ${file.source} copié vers ${file.target}`);
      } else {
        console.warn(`Le fichier source ${file.source} n'existe pas`);
      }
    }

    console.log('Tous les fichiers d\'exercices ont été copiés avec succès');
  } catch (error) {
    console.error('Erreur lors de la copie des fichiers d\'exercices:', error);
  }
}

copyExerciseFiles();
