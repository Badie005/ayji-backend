// backend/routes/cours.js
const express = require('express');
const router = express.Router();
const Cours = require('../models/Cours');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Obtenir tous les cours (accessible à tous)
router.get('/', async (req, res) => {
  try {
    const cours = await Cours.find().populate('createur', 'nom prenom');
    res.json(cours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obtenir un cours spécifique (accessible à tous)
router.get('/:id', async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id).populate('createur', 'nom prenom');
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    res.json(cours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer un nouveau cours (admin seulement)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const cours = new Cours({
    titre: req.body.titre,
    description: req.body.description,
    contenu: req.body.contenu,
    image: req.body.image,
    categories: req.body.categories,
    niveau: req.body.niveau,
    createur: req.user.id
  });

  try {
    const nouveauCours = await cours.save();
    res.status(201).json(nouveauCours);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mettre à jour un cours (admin seulement)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });

    const updateData = {
      titre: req.body.titre || cours.titre,
      description: req.body.description || cours.description,
      contenu: req.body.contenu || cours.contenu,
      image: req.body.image || cours.image,
      categories: req.body.categories || cours.categories,
      niveau: req.body.niveau || cours.niveau
    };

    const coursUpdated = await Cours.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(coursUpdated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un cours (admin seulement)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id);
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });

    await Cours.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;