const router = require('express').Router();
const authController = require('../controllers/auth.controller');

// Route pour l'inscription
router.post('/register', authController.register);

// Route pour la connexion
router.post('/login', authController.login);

module.exports = router;
