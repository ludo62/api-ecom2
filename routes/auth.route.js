const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour l'inscription admin et user
router.post('/register', cloudinaryUpload, authController.register);

// Route pour la connexion admin et user
router.post('/login', authController.login);

// Route pour la modification du profil
router.put('/update/:id', cloudinaryUpload, authController.update);

// Route pour la suppression du profil
router.delete('/delete/:id', authController.delete);

// Route pour recuperer tous les utilisateurs (admin)
router.get('/users', authMiddleware.authenticate, authController.getAllUsers);

// Route pour recuperer un utilisateur (admin)
router.get('/user/:id', authMiddleware.authenticate, authController.getUserById);

// Route protegée
router.get('/dashboard', authMiddleware.authenticate, (req, res) => {
	// Verifier si l'utilisateur est un admin
	if (req.user.role === 'admin') {
		// Definition de req.isAdmin sera egal a true pour les admins
		req.isAdmin = true;
		// Envoyer une réponse de succès
		return res.status(200).json({ message: 'Bienvenue Admin' });
	} else {
		// Envoyer une réponse pour les utilisateurs non admin
		return res.status(403).json({
			message: 'Action non autorisée, seuls les admin peuvent acceder à cette page',
		});
	}
});

module.exports = router;
