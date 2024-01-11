// Import du model utilisateur
const authModel = require('../models/auth.model');
// Import de la validation des données
const { validationResult } = require('express-validator');
// Import du modèle de hachage bcrypt
const bcrypt = require('bcryptjs');
// Import du module jwt pour les tokens
const jwt = require('jsonwebtoken');
// Import du module validator pour la validation des emails
const validator = require('validator');

// Fonction pour l'inscription
module.exports.register = async (req, res) => {
	// Validation des données d'entrée
	try {
		// Recuperation des erreurs de validations
		const errors = validationResult(req);
		// Verification si il y a des erreurs de validation
		if (!errors.isEmpty()) {
			// Renvoi des erreurs de validation
			return res.status(400).json({ errors: errors.array() });
		}
		// Recuperation des données du formulaire
		const { lastname, firstname, email, password } = req.body;

		// Verification de la longueur du mot de passe avec une condition
		if (password.length < 6) {
			// Verification de la longueur du mot de passe (6 caractères minimum)
			// Renvoie une erreur si le mot de passe est trop court
			return res
				.status(400)
				.json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
		}
		// Verification de la validité email avec validator
		if (!validator.isEmail(email)) {
			// Renvoie une erreur si l'email n'est pas valide
			return res.status(400).json({ message: 'Veuillez entrer un email valide' });
		}
		// Verification de l'email si il existe deja dans la base de données
		const existingUser = await authModel.findOne({ email });
		// Renvoie une erreur si l'email existe deja
		if (existingUser) {
			return res.status(400).json({
				message: 'Votre email existe déjà en base de données. Veuillez en choisir un autre',
			});
		}
		// Creation d'un nouvel utilisateur
		const user = authModel.create({ lastname, firstname, email, password });
		// Renvoie une reponse positive si l'utilisateur est bien enregistré
		res.status(201).json({ message: 'Utilisateur créé avec succès', user });
	} catch (error) {
		// Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
		res.status(500).json({ message: "Erreur lors de l'enregistrement de l'utilisateur" });
	}
};

// Fonction pour la connexion
module.exports.login = async (req, res) => {
	try {
		// Recuperation des erreurs de validations
		const errors = validationResult(req);
		// Verification si il y a des erreurs de validation
		if (!errors.isEmpty()) {
			// Renvoie des erreurs de validation
			return res.status(400).json({ errors: errors.array() });
		}
		// Recuperation des données du formulaire
		const { email, password } = req.body;

		// Verification si l'utilisateur existe déjà dans la base de données
		const user = await authModel.findOne({ email });

		// Si l'utilisateur n'existe pas, renvoie une erreur
		if (!user) {
			console.log('Utilisateur non trouvé');
			return res.status(400).json({ message: 'Email invalide' });
		}
		// Verification du mot de passe
		const isPasswordValid = await bcrypt.compare(
			// user.password = le mot de passe haché en base de données
			// password = mot de passe entré par l'utilisateur
			password,
			user.password
		);

		// Si le mot de passe est incorrect, renvoie une erreur
		if (!isPasswordValid) {
			console.log('Mot de passe incorrect');
			return res.status(400).json({ message: 'Mot de passe incorrect' });
		}
		// Renvoie d'un message de succès
		console.log('connexion réussie !');

		// Creation du token jwt
		const payload = {
			user: {
				id: user._id,
				email: user.email,
			},
		};
		// Definition de la variable pour le token
		const secretKey = process.env.JWT_SECRET;
		// Definition de la date d'expiration du token
		const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
		// Renvoie un message de reussite et le token
		res.status(200).json({ message: 'Connexion Réussie', token });
	} catch (error) {
		console.error('Erreur lors de la connexion : ', error.message);
		// Renvoie une erreur si il y a un probleme lors de la connexion de l'utilisateur
		res.status(500).json({ message: 'Erreur lors de la connexion' });
	}
};
