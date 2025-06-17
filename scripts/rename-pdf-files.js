const fs = require('fs');
const path = require('path');

// Chemin vers le dossier contenant les PDFs
const pdfFolder = path.join(__dirname, '..', 'public', 'uploads', 'courses');

// Mappings des noms de fichiers actuels vers les nouveaux noms
const fileMapping = {
  'Chapitre 1_Introduction aux réseaux informatiques.pdf': 'Chapitre_1_Introduction_aux_reseaux_informatiques.pdf',
  'Chapitre 2_Modèle OSI.pdf': 'Chapitre_2_Modele_OSI.pdf',
  'Chapitre 3_Adressage IPv4.pdf': 'Chapitre_3_Adressage_IPv4.pdf',
  'Chapitre 4_DHCP.pdf': 'Chapitre_4_DHCP.pdf',
  'Chapitre 5_DNS.pdf': 'Chapitre_5_DNS.pdf',
  'Chapitre 6_Services Web.pdf': 'Chapitre_6_Services_Web.pdf'
};

// Renommer les fichiers
async function renameFiles() {
  try {
    // Vérifier si le dossier existe
    if (!fs.existsSync(pdfFolder)) {
      console.error(`Le dossier ${pdfFolder} n'existe pas`);
      return;
    }

    // Lister les fichiers dans le dossier
    const files = fs.readdirSync(pdfFolder);
    console.log(`Fichiers trouvés dans ${pdfFolder}:`, files);

    // Renommer chaque fichier selon le mapping
    for (const [oldName, newName] of Object.entries(fileMapping)) {
      const oldPath = path.join(pdfFolder, oldName);
      const newPath = path.join(pdfFolder, newName);

      // Vérifier si le fichier source existe
      if (fs.existsSync(oldPath)) {
        // Créer une copie avec le nouveau nom
        fs.copyFileSync(oldPath, newPath);
        console.log(`Fichier ${oldName} copié vers ${newName}`);
      } else {
        console.warn(`Le fichier source ${oldName} n'existe pas`);
      }
    }

    console.log('Tous les fichiers ont été renommés avec succès');
  } catch (error) {
    console.error('Erreur lors du renommage des fichiers:', error);
  }
}

renameFiles();
