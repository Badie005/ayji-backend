const express = require('express');
const router = express.Router();
const Progression = require('../models/progression.model');
const { verifyToken } = require('../middleware/auth');

// Get all progressions for a user
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const progressions = await Progression.find({ user: req.params.userId });
    res.status(200).json(progressions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get progression for a specific course and user
router.get('/user/:userId/course/:courseId', verifyToken, async (req, res) => {
  try {
    const progression = await Progression.findOne({ 
      user: req.params.userId,
      course: req.params.courseId
    });
    
    if (!progression) {
      return res.status(404).json({ message: 'Progression not found' });
    }
    
    res.status(200).json(progression);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update a progression
router.put('/:id', verifyToken, async (req, res) => {
  try {
    let progression;
    
    if (req.params.id === 'new') {
      // Create a new progression
      progression = new Progression(req.body);
      await progression.save();
    } else {
      // Update existing progression
      progression = await Progression.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!progression) {
        return res.status(404).json({ message: 'Progression not found' });
      }
    }
    
    res.status(200).json(progression);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;