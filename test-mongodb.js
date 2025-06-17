// backend/test-mongodb.js
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Tentative de connexion à MongoDB...');
console.log('URL de connexion:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connexion à MongoDB réussie!');
  
  // Liste toutes les collections dans la base de données
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('Collections disponibles:', collections.map(c => c.name));
      
      // Créer une collection de test
      mongoose.connection.db.createCollection('test_collection')
        .then(() => {
          console.log('✅ Collection de test créée avec succès');
          
          // Insérer un document de test
          mongoose.connection.db.collection('test_collection').insertOne({
            test: 'document',
            date: new Date()
          })
            .then(() => {
              console.log('✅ Document de test inséré avec succès');
              mongoose.connection.close();
              console.log('Connexion fermée');
            })
            .catch(err => {
              console.error('❌ Erreur lors de l\'insertion du document:', err);
              mongoose.connection.close();
            });
        })
        .catch(err => {
          console.error('❌ Erreur lors de la création de la collection:', err);
          mongoose.connection.close();
        });
    })
    .catch(err => {
      console.error('❌ Erreur lors de la récupération des collections:', err);
      mongoose.connection.close();
    });
})
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
});