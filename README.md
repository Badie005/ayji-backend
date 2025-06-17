# AYJI Backend API

> Plateforme d'apprentissage en ligne AYJI - API Backend

[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.17.1-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4-brightgreen)](https://www.mongodb.com/)

API RESTful pour la plateforme d'apprentissage en ligne AYJI, fournissant l'authentification, la gestion des cours, des quiz et le suivi de progression.

## 🚀 Fonctionnalités

- **Authentification** : Inscription, connexion et gestion des utilisateurs
- **Gestion des cours** : Création, lecture, mise à jour et suppression des cours
- **Quiz et évaluations** : Système de quiz intégré avec notation
- **Suivi de progression** : Suivi de la progression des apprenants
- **Gestion des médias** : Téléchargement et gestion des fichiers (PDF, images, vidéos)
- **API sécurisée** : JWT, validation des données et gestion des erreurs

## 📦 Prérequis

- Node.js (v14+)
- MongoDB (v4.4+)
- npm (v6+) ou yarn

## 🛠 Installation

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/Badie005/ayji-backend.git
   cd ayji-backend
   ```

2. Installer les dépendances :
   ```bash
   npm install
   # ou
   yarn
   ```

3. Configurer les variables d'environnement :
   ```bash
   cp .env.example .env
   # Puis éditer le fichier .env avec vos configurations
   ```

4. Lancer le serveur :
   ```bash
   # Développement
   npm run dev
   
   # Production
   npm start
   ```

## 📂 Structure du projet

```
backend/
├── config/           # Fichiers de configuration
├── controllers/       # Contrôleurs pour les routes
├── middleware/        # Middleware personnalisés
├── models/            # Modèles de données MongoDB/Mongoose
├── routes/            # Définition des routes
├── scripts/           # Scripts utilitaires
├── services/          # Logique métier
├── uploads/           # Fichiers téléchargés
└── utils/             # Utilitaires et helpers
```

## 🔧 Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ayji
JWT_SECRET=votre_clé_secrète
JWT_EXPIRE=30d
NODE_ENV=development
```

## 📚 Documentation API

La documentation complète de l'API est disponible via Swagger UI à l'adresse :
`http://localhost:3000/api-docs` (en développement)

## 🧪 Tests

Pour lancer les tests :

```bash
npm test
```

## 🤝 Contribution

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

## 📞 Contact

AYJI Team - [@ayji](https://github.com/Badie005)

Lien du projet : [https://github.com/Badie005/ayji-backend](https://github.com/Badie005/ayji-backend)
