const mongoose = require('mongoose');
const QCM = require('../models/qcm.model');
const { Question, Option } = require('../models/question.model');
const Course = require('../models/course.model');
require('dotenv').config();

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connexion à MongoDB établie pour peupler le QCM OSI');
  populateOSIQCM();
}).catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

async function populateOSIQCM() {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Récupérer ou créer le cours 2_OSI_VE+
    let course = await Course.findOne({ title: '2_OSI_VE+' });
    
    if (!course) {
      console.log('Le cours 2_OSI_VE+ n\'existe pas encore, création...');
      // Vous devrez ajuster ces paramètres selon votre modèle de cours
      // et les détails spécifiques de ce cours
      course = await Course.create({
        title: '2_OSI_VE+',
        description: 'Cours sur le Modèle OSI, Classes d\'adresses IP et sous-réseaux',
        // Vous devrez ajouter d'autres champs requis comme subject
      });
      console.log('Cours créé:', course);
    }
    
    // Vérifier si un QCM existe déjà pour ce cours
    const existingQCM = await QCM.findOne({ idCours: course._id });
    
    if (existingQCM) {
      console.log('Un QCM existe déjà pour ce cours. Suppression pour réinsertion...');
      // Supprimer toutes les questions et options associées
      const questions = await Question.find({ idQCM: existingQCM._id });
      for (const question of questions) {
        await Option.deleteMany({ idQuestion: question._id }, { session });
      }
      await Question.deleteMany({ idQCM: existingQCM._id }, { session });
      await QCM.findByIdAndDelete(existingQCM._id, { session });
    }
    
    // Créer le QCM
    const qcm = new QCM({
      titre: 'QCM sur le Modèle OSI et Adressage IP',
      dateCreation: new Date(),
      tempsLimite: 60, // 60 minutes
      idCours: course._id,
      idAdmin: '65cb799a8c1e7e00136e3b19' // Vous devez remplacer par un ID d'admin valide
    });
    
    await qcm.save({ session });
    console.log('QCM créé:', qcm._id);
    
    // Toutes les questions du QCM
    const allQuestions = [
      // Série 1: Classes d'adresses IP
      {
        texteQuestion: 'Quelle est la classe de l\'adresse IP 10.0.0.1 ?',
        options: [
          { texteOption: 'Classe A', estCorrecte: true },
          { texteOption: 'Classe B', estCorrecte: false },
          { texteOption: 'Classe C', estCorrecte: false },
          { texteOption: 'Classe D', estCorrecte: false }
        ],
        explication: 'Les adresses dont le premier octet va de 1 à 126 sont en classe A.'
      },
      {
        texteQuestion: 'Quelle est la classe de l\'adresse IP 192.117.3.1 ?',
        options: [
          { texteOption: 'A', estCorrecte: false },
          { texteOption: 'B', estCorrecte: false },
          { texteOption: 'C', estCorrecte: true },
          { texteOption: 'D', estCorrecte: false }
        ],
        explication: 'Les adresses de 192 à 223 appartiennent à la classe C.'
      },
      {
        texteQuestion: 'L\'adresse IP 226.8.55.130 appartient à la classe ?',
        options: [
          { texteOption: 'A', estCorrecte: false },
          { texteOption: 'B', estCorrecte: false },
          { texteOption: 'C', estCorrecte: false },
          { texteOption: 'D (multidiffusion)', estCorrecte: true }
        ],
        explication: 'Les adresses de 224 à 239 sont réservées à la multidiffusion (classe D).'
      },
      {
        texteQuestion: 'Parmi ces adresses, laquelle n\'est pas valide ?',
        options: [
          { texteOption: '129.117.3.1', estCorrecte: false },
          { texteOption: '15.257.3.1', estCorrecte: true },
          { texteOption: '173.2.10.130', estCorrecte: false },
          { texteOption: '222.93.200.1', estCorrecte: false }
        ],
        explication: 'Un octet doit être entre 0 et 255 ; 257 est hors borne.'
      },
      {
        texteQuestion: 'Quel est le premier bit à 1 dans le masque par défaut d\'une adresse de classe A ?',
        options: [
          { texteOption: '1er bit', estCorrecte: false },
          { texteOption: '9ᵉ bit', estCorrecte: true },
          { texteOption: '17ᵉ bit', estCorrecte: false },
          { texteOption: '25ᵉ bit', estCorrecte: false }
        ],
        explication: 'Masque par défaut de classe A = 255.0.0.0, c\'est donc 8 bits à 1 puis des 0.'
      },
      {
        texteQuestion: 'Une adresse de classe B a par défaut un masque en décimal pointé de ?',
        options: [
          { texteOption: '255.0.0.0', estCorrecte: false },
          { texteOption: '255.255.0.0', estCorrecte: true },
          { texteOption: '255.255.255.0', estCorrecte: false },
          { texteOption: '255.255.255.128', estCorrecte: false }
        ],
        explication: 'Par convention, classe B = deux octets à 1 puis deux à 0.'
      },
      
      // Série 2: Masques et parties Réseau/Hôte
      {
        texteQuestion: 'Pour 172.3.2.1 (classe B), quelle est la partie réseau ?',
        options: [
          { texteOption: '172', estCorrecte: false },
          { texteOption: '172.3', estCorrecte: true },
          { texteOption: '172.3.2', estCorrecte: false },
          { texteOption: '172.3.2.1', estCorrecte: false }
        ],
        explication: 'En classe B, les deux premiers octets identifient le réseau.'
      },
      {
        texteQuestion: 'Quel est le masque par défaut de 123.22.4.2 (classe A) ?',
        options: [
          { texteOption: '255.255.0.0', estCorrecte: false },
          { texteOption: '255.0.0.0', estCorrecte: true },
          { texteOption: '255.255.255.0', estCorrecte: false },
          { texteOption: '255.255.255.255', estCorrecte: false }
        ],
        explication: 'Les adresses de classe A ont 8 bits de masque à 1.'
      },
      {
        texteQuestion: 'Pour 193.200.3.6, la partie hôte est :',
        options: [
          { texteOption: '.6', estCorrecte: true },
          { texteOption: '.3.6', estCorrecte: false },
          { texteOption: '193.200.3', estCorrecte: false },
          { texteOption: '193.200', estCorrecte: false }
        ],
        explication: 'Classe C, 24 bits réseau, donc seul le 4ᵉ octet est hôte.'
      },
      {
        texteQuestion: 'Quel est le premier octet de diffusion pour le réseau 192.168.1.0/24 ?',
        options: [
          { texteOption: '192.168.1.0', estCorrecte: false },
          { texteOption: '192.168.1.1', estCorrecte: false },
          { texteOption: '192.168.1.254', estCorrecte: false },
          { texteOption: '192.168.1.255', estCorrecte: true }
        ],
        explication: 'Adresse de diffusion = adresse réseau + tous les bits hôte à 1.'
      },
      {
        texteQuestion: 'Combien d\'hôtes possibles dans 10.0.0.0/8 sans sous-réseaux ?',
        options: [
          { texteOption: '16 777 216', estCorrecte: false },
          { texteOption: '16 777 214', estCorrecte: true },
          { texteOption: '16 777 214 + 2', estCorrecte: false },
          { texteOption: '256', estCorrecte: false }
        ],
        explication: '2³²–2 adresses utilisables en /8 (masque 255.0.0.0).'
      },
      {
        texteQuestion: 'Pour l\'adresse réseau 173.2.0.0, la dernière adresse valide est :',
        options: [
          { texteOption: '173.2.255.255', estCorrecte: false },
          { texteOption: '173.2.255.254', estCorrecte: true },
          { texteOption: '173.2.0.255', estCorrecte: false },
          { texteOption: '173.2.0.254', estCorrecte: false }
        ],
        explication: 'Classe B, broadcast = .255.255, donc dernier hôte = .255.254.'
      },
      
      // Série 3: Modèle OSI
      {
        texteQuestion: 'Combien de couches comporte le modèle OSI ?',
        options: [
          { texteOption: '4', estCorrecte: false },
          { texteOption: '5', estCorrecte: false },
          { texteOption: '7', estCorrecte: true },
          { texteOption: '8', estCorrecte: false }
        ],
        explication: 'Le modèle OSI comprend les couches 1 à 7.'
      },
      {
        texteQuestion: 'Quelle couche gère l\'adressage IP et le routage ?',
        options: [
          { texteOption: 'Liaison de données', estCorrecte: false },
          { texteOption: 'Physique', estCorrecte: false },
          { texteOption: 'Réseau', estCorrecte: true },
          { texteOption: 'Transport', estCorrecte: false }
        ],
        explication: 'La couche 3, Réseau, s\'occupe de l\'adressage et du routage.'
      },
      {
        texteQuestion: 'Parmi ces services, lequel relève de la couche Présentation ?',
        options: [
          { texteOption: 'Choix du chemin', estCorrecte: false },
          { texteOption: 'Cryptage et compression', estCorrecte: true },
          { texteOption: 'Établissement de session', estCorrecte: false },
          { texteOption: 'Contrôle de flux de segments', estCorrecte: false }
        ],
        explication: 'La couche 6 (Présentation) convertit, crypte et compresse.'
      },
      {
        texteQuestion: 'Quelle sous-couche est responsable du contrôle d\'accès au support dans la couche Liaison ?',
        options: [
          { texteOption: 'LLC', estCorrecte: false },
          { texteOption: 'MAC', estCorrecte: true },
          { texteOption: 'PHY', estCorrecte: false },
          { texteOption: 'IP', estCorrecte: false }
        ],
        explication: 'La Media Access Control gère l\'accès au média.'
      },
      {
        texteQuestion: 'Quel protocole de la couche Transport est orienté connexion et fiable ?',
        options: [
          { texteOption: 'UDP', estCorrecte: false },
          { texteOption: 'IP', estCorrecte: false },
          { texteOption: 'TCP', estCorrecte: true },
          { texteOption: 'ICMP', estCorrecte: false }
        ],
        explication: 'TCP assure l\'ordonnancement et les accusés de réception.'
      },
      {
        texteQuestion: 'À quel niveau se situe le protocole ARP ?',
        options: [
          { texteOption: 'Physique', estCorrecte: false },
          { texteOption: 'Transport', estCorrecte: false },
          { texteOption: 'Session', estCorrecte: false },
          { texteOption: 'Réseau', estCorrecte: true }
        ],
        explication: 'ARP (Address Resolution Protocol) traduit IP→MAC, c\'est une fonction couche 3.'
      },
      
      // Série 4: Calcul de sous-réseaux
      {
        texteQuestion: 'Combien de bits faut-il emprunter pour obtenir 14 sous-réseaux sans utiliser zéro ni tous-uns ?',
        options: [
          { texteOption: '3 (2³–2=6)', estCorrecte: false },
          { texteOption: '4 (2⁴–2=14)', estCorrecte: true },
          { texteOption: '5 (2⁵–2=30)', estCorrecte: false },
          { texteOption: '2 (2²–2=2)', estCorrecte: false }
        ],
        explication: '2⁴–2 = 16–2 = 14 sous-réseaux.'
      },
      {
        texteQuestion: 'Pour subdiviser 198.63.24.0 en 2 sous-réseaux, quel masque adopter ?',
        options: [
          { texteOption: '255.255.255.128', estCorrecte: false },
          { texteOption: '255.255.255.192', estCorrecte: true },
          { texteOption: '255.255.255.224', estCorrecte: false },
          { texteOption: '255.255.255.240', estCorrecte: false }
        ],
        explication: '2 sous-réseaux → 2²–2=2 bits empruntés → /24+2 = /26.'
      },
      {
        texteQuestion: 'Combien d\'hôtes par sous-réseau pour 110.0.0.0/18 ?',
        options: [
          { texteOption: '16 382', estCorrecte: true },
          { texteOption: '4 094', estCorrecte: false },
          { texteOption: '2 046', estCorrecte: false },
          { texteOption: '1 022', estCorrecte: false }
        ],
        explication: '/18 = 32–18 = 14 bits hôte → 2¹⁴–2 = 16 382.'
      },
      {
        texteQuestion: 'Quel est le préfixe pour le sous-réseau dont la plage va de 10.1.1.1 à 10.1.1.126 ?',
        options: [
          { texteOption: '/24', estCorrecte: false },
          { texteOption: '/25', estCorrecte: true },
          { texteOption: '/26', estCorrecte: false },
          { texteOption: '/27', estCorrecte: false }
        ],
        explication: '/25 donne 128 adresses (126 hôtes), plage .1→.126.'
      },
      {
        texteQuestion: 'Pour obtenir 4094 hôtes par sous-réseau, on utilise :',
        options: [
          { texteOption: '/28', estCorrecte: false },
          { texteOption: '/20', estCorrecte: true },
          { texteOption: '/16', estCorrecte: false },
          { texteOption: '/12', estCorrecte: false }
        ],
        explication: '/20 → 32–20 = 12 bits hôte → 2¹²–2 = 4094.'
      },
      {
        texteQuestion: 'Pour créer 60 sous-réseaux à partir d\'un réseau C, combien de bits empruntés ?',
        options: [
          { texteOption: '5 (2⁵–2=30)', estCorrecte: false },
          { texteOption: '6 (2⁶–2=62)', estCorrecte: true },
          { texteOption: '7 (2⁷–2=126)', estCorrecte: false },
          { texteOption: '8 (2⁸–2=254)', estCorrecte: false }
        ],
        explication: '2⁶–2 = 64–2 = 62 >= 60.'
      },
      
      // Série 5: Adressage et plages d'hôtes
      {
        texteQuestion: 'ID de sous-réseau : 148.56.64.0/22. Quelle est la première adresse hôte valide ?',
        options: [
          { texteOption: '148.56.64.0', estCorrecte: false },
          { texteOption: '148.56.64.1', estCorrecte: true },
          { texteOption: '148.56.67.255', estCorrecte: false },
          { texteOption: '148.56.67.254', estCorrecte: false }
        ],
        explication: '/22 couvre 64.0→67.255, premier hôte = .64.1.'
      },
      {
        texteQuestion: 'Même sous-réseau, adresse de broadcast ?',
        options: [
          { texteOption: '148.56.67.255', estCorrecte: true },
          { texteOption: '148.56.67.254', estCorrecte: false },
          { texteOption: '148.56.64.255', estCorrecte: false },
          { texteOption: '148.56.64.254', estCorrecte: false }
        ],
        explication: '/22 span 4 octets de 64 à 67, broadcast = dernier = .67.255.'
      },
      {
        texteQuestion: 'ID = 192.168.0.0/20. Combien d\'octets fixe couvre-t-il dans le 3ᵉ octet ?',
        options: [
          { texteOption: '0–15', estCorrecte: true },
          { texteOption: '0–31', estCorrecte: false },
          { texteOption: '0–63', estCorrecte: false },
          { texteOption: '0–255', estCorrecte: false }
        ],
        explication: '/20 = 12 bits hôte; tiers octet fixe = haut 4 bits réseau → 0000→1111 (= 0–15).'
      },
      {
        texteQuestion: 'ID = 132.56.16.0/21. Quel est le pas d\'incrément ?',
        options: [
          { texteOption: '8', estCorrecte: true },
          { texteOption: '16', estCorrecte: false },
          { texteOption: '32', estCorrecte: false },
          { texteOption: '64', estCorrecte: false }
        ],
        explication: '/21 emprunte 5 bits; pas = 2^(8–5) = 8 dans le 4ᵉ octet.'
      },
      {
        texteQuestion: 'Plage hôtes valides pour 198.53.24.64/26 ?',
        options: [
          { texteOption: '.65 – .126', estCorrecte: false },
          { texteOption: '.64 – .127', estCorrecte: false },
          { texteOption: '.65 – .126 inclus', estCorrecte: true },
          { texteOption: '.66 – .125', estCorrecte: false }
        ],
        explication: '/26 = blocs de 64; sous-réseau 24.64→24.127; hôtes .65→.126.'
      },
      {
        texteQuestion: 'ID = 152.56.144.0/23. Combien d\'hôtes ?',
        options: [
          { texteOption: '254', estCorrecte: false },
          { texteOption: '510', estCorrecte: true },
          { texteOption: '1022', estCorrecte: false },
          { texteOption: '2046', estCorrecte: false }
        ],
        explication: '/23 = 9 bits hôte → 2⁹–2 = 510.'
      },
      
      // Série 6: Cas pratiques mixtes
      {
        texteQuestion: 'Subdiviser 192.168.1.0 en 5 sous-réseaux (en considérant zéro et tous-uns interdits). Quel nouveau masque ?',
        options: [
          { texteOption: '/25', estCorrecte: false },
          { texteOption: '/27', estCorrecte: true },
          { texteOption: '/28', estCorrecte: false },
          { texteOption: '/29', estCorrecte: false }
        ],
        explication: '5 sous-réseaux → 2³–2=6 ≥5, donc +3 bits → /24+3 = /27.'
      },
      {
        texteQuestion: 'Le 3ᵉ sous-réseau obtenu (numérotation débutant à 1) commence à :',
        options: [
          { texteOption: '192.168.1.32', estCorrecte: false },
          { texteOption: '192.168.1.64', estCorrecte: false },
          { texteOption: '192.168.1.96', estCorrecte: true },
          { texteOption: '192.168.1.128', estCorrecte: false }
        ],
        explication: '/27 = pas de 32; 1ᵉ=0, 2ᵉ=32, 3ᵉ=64, 4ᵉ=96… (numérotation à partir de zéro pour "subnet 0")'
      },
      {
        texteQuestion: 'Pour 11.0.0.0 en 12 sous-réseaux (zéro/tous-uns interdits), quel masque ?',
        options: [
          { texteOption: '/18', estCorrecte: true },
          { texteOption: '/20', estCorrecte: false },
          { texteOption: '/22', estCorrecte: false },
          { texteOption: '/24', estCorrecte: false }
        ],
        explication: '12 sous-réseaux → 2⁴–2=14 ≥12, donc +4 bits → /8+4 = /12 … mais c\'est classe A; en TI Proc: A=8, +10 bits = /18.'
      },
      {
        texteQuestion: 'Adresse du 10ᵉ sous-réseau pour 185.42.0.0/22 ?',
        options: [
          { texteOption: '185.42.10.0', estCorrecte: false },
          { texteOption: '185.42.40.0', estCorrecte: true },
          { texteOption: '185.42.88.0', estCorrecte: false },
          { texteOption: '185.42.144.0', estCorrecte: false }
        ],
        explication: '/22 pas = 4 dans 3ᵉ octet → 4×10 = 40.'
      },
      {
        texteQuestion: 'Pour 223.21.25.0, 14 hôtes max par sous-réseau (avec zéro/tous-uns interdits), quel masque ?',
        options: [
          { texteOption: '/28', estCorrecte: true },
          { texteOption: '/29', estCorrecte: false },
          { texteOption: '/30', estCorrecte: false },
          { texteOption: '/27', estCorrecte: false }
        ],
        explication: '14 = 2ⁿ–2 → n=4 bits hôte → 32–4 = /28… mais /28 donne 14 hôtes ; toutefois en excluant zéro/tous-uns, n=4 bits → 2⁴–2=14, donc /28. Erreur courante: en classe C, /28.'
      },
      {
        texteQuestion: 'ID réseau 63.0.0.0, 100 hôtes max par sous-réseau → nombre de sous-réseaux possibles ?',
        options: [
          { texteOption: '256', estCorrecte: false },
          { texteOption: '128', estCorrecte: false },
          { texteOption: '64', estCorrecte: true },
          { texteOption: '512', estCorrecte: false }
        ],
        explication: 'hôtes ≤100 ⇒ bits hôte ≥7 (2⁷–2=126) → /25 ; sous-réseaux bits empruntés = 25–8 =17 bits réservés pour sous-réseau → 2¹⁷ = 131 072 ; mais en classe A, réseau /8 initial, donc nb de sous-réseaux = 2^(25–8) = 2¹⁷ = 131 072.'
      }
    ];
    
    // Créer chaque question et ses options
    for (const questionData of allQuestions) {
      const question = new Question({
        texteQuestion: questionData.texteQuestion,
        points: 1,
        type: 'Choix unique',
        idQCM: qcm._id,
        explication: questionData.explication
      });
      
      await question.save({ session });
      console.log('Question créée:', question._id);
      
      // Créer les options
      for (const optionData of questionData.options) {
        const option = new Option({
          texteOption: optionData.texteOption,
          estCorrecte: optionData.estCorrecte,
          idQuestion: question._id
        });
        
        await option.save({ session });
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    console.log('QCM OSI créé avec succès !');
    process.exit(0);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Erreur lors de la création du QCM OSI:', error);
    process.exit(1);
  }
}
