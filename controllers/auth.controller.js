// Import du model utilisateur
const authModel = require('../models/auth.model');
// Import de la validation des données
const { validationResult } = require('express-validator');
// Import du modèle de hachage bcrypt
const bcrypt = require('bcrypt');
// Import du module jwt pour les tokens
const jwt = require('jsonwebtoken');

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
