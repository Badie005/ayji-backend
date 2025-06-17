const fs = require('fs');
const path = require('path');

// Chemin vers le dossier contenant les PDFs
const pdfFolder = path.join(__dirname, '..', 'public', 'uploads', 'courses');

// Simplifier les noms de fichiers pour éviter les problèmes d'encodage
const simplifiedNames = [
  {
    id: '1',
    filename: 'cours1.pdf',
    source: 'Chapitre_1_Introduction_aux_reseaux_informatiques.pdf'
  },
  {
    id: '2',
    filename: 'cours2.pdf',
    source: 'Chapitre_2_Modele_OSI.pdf'
  },
  {
    id: '3',
    filename: 'cours3.pdf',
    source: 'Chapitre_3_Adressage_IPv4.pdf'
  },
  {
    id: '4',
    filename: 'cours4.pdf',
    source: 'Chapitre_4_DHCP.pdf'
  },
  {
    id: '5',
    filename: 'cours5.pdf',
    source: 'Chapitre_5_DNS.pdf'
  },
  {
    id: '6',
    filename: 'cours6.pdf',
    source: 'Chapitre_6_Services_Web.pdf'
  }
];

// Créer des copies simples des fichiers PDFs
async function createSimplifiedPDFs() {
  try {
    // Vérifier si le dossier existe
    if (!fs.existsSync(pdfFolder)) {
      console.error(`Le dossier ${pdfFolder} n'existe pas`);
      return;
    }

    // Lister les fichiers dans le dossier
    const files = fs.readdirSync(pdfFolder);
    console.log(`Fichiers trouvés dans ${pdfFolder}:`, files);

    // Créer des copies simplifiées pour chaque fichier
    for (const item of simplifiedNames) {
      const sourcePath = path.join(pdfFolder, item.source);
      const targetPath = path.join(pdfFolder, item.filename);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Fichier ${item.source} copié vers ${item.filename}`);
      } else {
        // Essayer de trouver un fichier qui contient les éléments clés du nom
        const altSourceFiles = files.filter(f => 
          f.includes(`Chapitre ${item.id}`) || 
          f.includes(`Chapitre${item.id}`) || 
          f.includes(`${item.id}_`)
        );

        if (altSourceFiles.length > 0) {
          const altSource = altSourceFiles[0];
          const altSourcePath = path.join(pdfFolder, altSource);
          fs.copyFileSync(altSourcePath, targetPath);
          console.log(`Alternative: Fichier ${altSource} copié vers ${item.filename}`);
        } else {
          console.warn(`AUCUN fichier source trouvé pour le cours ${item.id}`);
        }
      }
    }

    console.log('Création des fichiers PDF simplifiés terminée');
  } catch (error) {
    console.error('Erreur lors de la création des fichiers PDF:', error);
  }
}

createSimplifiedPDFs();
