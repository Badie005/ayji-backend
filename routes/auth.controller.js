exports.register = async (req, res) => {
  try {
    console.log('Données d\'inscription reçues:', req.body);
    
    // Retourner une réponse de test sans traiter la demande
    return res.status(201).json({
      success: true,
      message: 'Test - Réponse sans traitement de la base de données',
      data: {
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        role: req.body.role || 'etudiant'
      }
    });
    
    // Le reste du code ne sera pas exécuté...
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'inscription', 
      error: error.message
    });
  }
};