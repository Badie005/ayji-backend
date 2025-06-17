/**
 * Script pour créer des copies des fichiers PDF avec des noms alternatifs
 * Cela permet à l'application d'accéder aux fichiers PDF via différentes URLs
 */

const fs = require('fs');
const path = require('path');

const pdfDir = path.join(__dirname, '..', 'public', 'uploads', 'courses');

// Mappings entre les noms recherchés et les noms de fichiers réels
const fileNameMappings = [
  { 
    requested: 'Chapitre 1_Introduction aux réseaux informatiques.pdf', 
    actual: '1_Introduction aux réseaux informatiques.pdf' 
  },
  { 
    requested: 'Chapitre 2_Modèle OSI.pdf', 
    actual: '2_OSI_VE+.pdf' 
  },
  { 
    requested: "Chapitre 3_Adressage IPv4.pdf", 
    actual: "3 _Techniques d'adressage d_un réseau local&.pdf" 
  },
  { 
    requested: 'Chapitre 4_DHCP.pdf', 
    actual: '4_Service_DHCP.pdf' 
  },
  { 
    requested: 'Chapitre 5_DNS.pdf', 
    actual: '5_Service_DNS.pdf' 
  },
  { 
    requested: 'Chapitre 6_Services Web.pdf', 
    actual: '6_services web.pdf' 
  }
];

// S'assurer que le répertoire existe
if (!fs.existsSync(pdfDir)) {
  console.log(`Création du répertoire: ${pdfDir}`);
  fs.mkdirSync(pdfDir, { recursive: true });
}

console.log('Fichiers PDF disponibles:');
const existingFiles = fs.readdirSync(pdfDir);
console.log(existingFiles);

// Créer des copies pour chaque mapping
fileNameMappings.forEach(mapping => {
  const sourcePath = path.join(pdfDir, mapping.actual);
  const targetPath = path.join(pdfDir, mapping.requested);
  
  if (fs.existsSync(sourcePath)) {
    if (!fs.existsSync(targetPath)) {
      // Copier le fichier
      console.log(`Création d'une copie: ${mapping.actual} -> ${mapping.requested}`);
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log('Copie créée avec succès');
      } catch (error) {
        console.error(`Erreur lors de la copie: ${error.message}`);
      }
    } else {
      console.log(`Le fichier cible existe déjà: ${mapping.requested}`);
    }
  } else {
    console.log(`Fichier source introuvable: ${mapping.actual}`);
  }
});

console.log('\nFichiers PDF après création des copies:');
console.log(fs.readdirSync(pdfDir));
