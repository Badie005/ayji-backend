const express = require('express');
const router = express.Router();
const Exercise = require('../models/exercise.model');
const { verifyToken } = require('../middleware/auth');

// Get all exercises
router.get('/', verifyToken, async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ order: 1 });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exercise by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercice non trouvé' });
    }
    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get exercises by course
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const exercises = await Exercise.find({ course: req.params.courseId }).sort({ order: 1 });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new exercise (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const exercise = new Exercise(req.body);
    const savedExercise = await exercise.save();
    res.status(201).json(savedExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an exercise (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedExercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExercise) {
      return res.status(404).json({ message: 'Exercice non trouvé' });
    }
    res.status(200).json(updatedExercise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an exercise (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedExercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!deletedExercise) {
      return res.status(404).json({ message: 'Exercice non trouvé' });
    }
    res.status(200).json({ message: 'Exercice supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
