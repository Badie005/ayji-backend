# AYJI Backend API

[![License: Academic](https://img.shields.io/badge/License-Academic%20Project-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?logo=mongodb)](https://www.mongodb.com/)

---

## Présentation

API RESTful pour la plateforme d'apprentissage en ligne **AYJI**, fournissant les services backend essentiels : authentification, gestion des cours, quiz et suivi de progression.

> **Type de projet** : Personnel / Académique

---

## Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Authentification** | Inscription, connexion, JWT et gestion des sessions |
| **Gestion des cours** | CRUD complet pour les cours et modules |
| **Quiz et évaluations** | Système de quiz intégré avec notation automatique |
| **Suivi de progression** | Tracking de l'avancement des apprenants |
| **Gestion des médias** | Upload et gestion des fichiers (PDF, images, vidéos) |
| **Communication temps réel** | Notifications via Socket.io |
| **API sécurisée** | Validation des données, gestion des erreurs |

---

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Express.js** | 4.x | Framework web |
| **MongoDB** | 6+ | Base de données NoSQL |
| **Mongoose** | 8.x | ODM pour MongoDB |
| **JWT** | - | Authentification |
| **Passport.js** | - | Stratégies d'authentification |
| **Socket.io** | - | Communication temps réel |
| **Swagger** | - | Documentation API |

---

## Prérequis

| Outil | Version recommandée |
|-------|---------------------|
| Node.js | >= 20.x |
| MongoDB | >= 6.x |
| npm / yarn | >= 8.x |

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Badie005/ayji-backend.git
cd ayji-backend

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos configurations

# 4. Lancer le serveur
npm run dev     # Développement
npm start       # Production
```

---

## Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
MONGODB_URI=mongodb://localhost:27017/ayji

# Authentification
JWT_SECRET=votre_clé_secrète_très_longue
JWT_EXPIRE=30d

# Optionnel
UPLOAD_MAX_SIZE=10mb
```

---

## Structure du projet

```
backend/
├── config/           # Configuration (DB, JWT, etc.)
├── controllers/      # Logique des endpoints
├── middleware/       # Auth, validation, error handling
├── models/           # Schémas Mongoose
├── routes/           # Définition des routes API
├── services/         # Logique métier
├── scripts/          # Scripts utilitaires
├── uploads/          # Fichiers téléchargés
├── utils/            # Helpers et fonctions utilitaires
└── app.js            # Point d'entrée
```

---

## Documentation API

La documentation Swagger est disponible en développement :

```
http://localhost:3000/api-docs
```

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion |
| `GET` | `/api/courses` | Liste des cours |
| `GET` | `/api/courses/:id` | Détail d'un cours |
| `POST` | `/api/quiz/submit` | Soumettre un quiz |
| `GET` | `/api/progress` | Progression utilisateur |

---

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement (nodemon) |
| `npm start` | Serveur de production |
| `npm test` | Lancer les tests |
| `npm run lint` | Vérifier la qualité du code |

---

## Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm run test:coverage
```

---

## Projets liés

| Projet | Description | Lien |
|--------|-------------|------|
| **AYJI Frontend** | Interface utilisateur (Angular) | [ayji-frontend](https://github.com/Badie005/ayji-frontend) |

---

## Contribution

Ce projet étant académique, les contributions sont les bienvenues à des fins éducatives :

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'feat: add AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## Licence

Ce projet est sous **licence académique personnalisée**.

- Consultation et fork autorisés pour usage éducatif
- Usage commercial interdit sans autorisation
- Voir le fichier [LICENSE](LICENSE) pour plus de détails

---

## Auteur

**Abdelbadie Khoubiza**

| Plateforme | Lien |
|------------|------|
| GitHub | [@Badie005](https://github.com/Badie005) |
| Email | [a.khoubiza.dev@gmail.com](mailto:a.khoubiza.dev@gmail.com) |
| Portfolio | [portfoliobadie.vercel.app](https://portfoliobadie.vercel.app) |
| LinkedIn | [Badie Khoubiza](https://www.linkedin.com/in/badie-khoubiza) |

---

Copyright © 2025 Abdelbadie Khoubiza - Tous droits réservés
