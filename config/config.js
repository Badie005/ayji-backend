// backend/config/config.js
module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/AYJI',
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h'
};