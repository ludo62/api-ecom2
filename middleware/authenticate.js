// Import du modèle utilisateur
const authModel = require('../models/auth.model');
// Import du JWT
const jwt = require('jsonwebtoken');

// Middleware pour l'authentification des administrateurs
module.exports.authenticate = async (req, res, next) => {
	try {
		// Récupérer le token d'authentification de l'en-tête
		const authHeader = req.header('Authorization');

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message:
					"Vous devez être connecté en tant qu'administrateur pour accéder à cette page",
			});
		}

		// Extraire le token sans le préfixe 'Bearer'
		const token = authHeader.split(' ')[1];

		console.log('Decoded token:', jwt.decode(token));

		// Vérifier la validité du token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Vérifier si l'utilisateur existe dans la base de données
		const user = await authModel.findById(decoded.user.id);

		if (!user) {
			return res.status(403).json({
				message: 'Action non autorisée, seuls les admin peuvent accéder à cette page',
			});
		}

		// Assigner l'utilisateur à la propriété user de la requête
		req.user = user;
		next();
	} catch (error) {
		console.error("Erreur lors de l'authentification : ", error.message);
		res.status(500).json({ message: "Erreur lors de l'authentification" });
	}
};

// fonction pour valider le token d'authentification
module.exports.verifToken = async (req, res, next) => {
	try {
		// Definition de la variable pour l'autorisation
		const authHeader = req.header('Authorization');

		// condition qui vérifie la variable et qui ajoute un Bearer comme exception
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message: 'Vous devez être connecté pour éffectuer cette action sur votre profil',
			});
		}

		// Extraction du token sans le prefixe 'Bearer'
		const token = authHeader.split(' ')[1];

		// Vérifier la validité du token en utilisant JWT
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			// Si une erreur survient pendant la vérification, renvoyer une erreur
			if (err) {
				return res.status(401).json({ message: 'Token invalide' });
			}

			// si la vérification est réussie, ajouter les informations du token dans la requête
			req.tokenInfo = decoded;

			// Passer à la prochaine étape du middleware ou à la route
			next();
		});
	} catch (error) {
		console.error('Erreur lors de la récupération du token : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération du token' });
	}
};
