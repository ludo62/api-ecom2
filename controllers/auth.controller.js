// Import du model auth
const authModel = require('../models/auth.model');
// Import de la validation des données
const { validationResult } = require('express-validator');
// Import du modèle de hachage bcrypt
const bcrypt = require('bcryptjs');
// Import du module jwt pour les tokens
const jwt = require('jsonwebtoken');

const cloudinary = require('cloudinary').v2;

// Fonction pour l'inscription
module.exports.register = async (req, res) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { lastname, firstname, email, password, birthday, address, zipcode, city, phone } =
			req.body;

		// Vérification si une image est téléchargée
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}

		// Vérifier si l'email existe déjà dans la table auth
		const existingAuth = await authModel.findOne({ email });

		if (existingAuth) {
			return res.status(400).json({
				message: 'Votre email existe déjà en base de données. Veuillez en choisir un autre',
			});
		}

		// Utilisation de l'url de Cloudinary et du public_id provenant du middleware
		const avatarUrl = req.cloudinaryUrl;
		const avatarPublicId = req.file.public_id;

		// Créer un nouvel utilisateur dans la table auth
		const auth = await authModel.create({
			lastname,
			firstname,
			email,
			password,
			birthday,
			address,
			zipcode,
			city,
			phone,
			avatarUrl,
			avatarPublicId,
		});

		res.status(201).json({ message: 'Utilisateur créé avec succès', auth });
	} catch (error) {
		console.error(error);
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

// Fonction pour la modification du profil utilisateur
module.exports.update = async (req, res) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const userId = req.params.id;
		const { lastname, firstname, email, birthday, address, zipcode, city, phone } = req.body;

		// Vérifier si l'utilisateur existe avant la mise à jour
		const existingUser = await authModel.findById(userId);

		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Supprimer l'ancienne image de Cloudinary si elle existe
		if (req.file) {
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
		}

		// Mettre à jour les informations de l'utilisateur
		existingUser.lastname = lastname;
		existingUser.firstname = firstname;
		existingUser.birthday = birthday;
		existingUser.address = address;
		existingUser.zipcode = zipcode;
		existingUser.city = city;
		existingUser.phone = phone;

		// Mettre à jour l'email uniquement si fourni dans la requête
		if (email) {
			existingUser.email = email;
		}

		// Sauvegarder les modifications
		await existingUser.save();

		res.status(200).json({
			message: 'Informations utilisateur mises à jour avec succès',
			user: existingUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Erreur lors de la mise à jour des informations utilisateur.',
		});
	}
};

// Fonction pour la suppression du profil utilisateur
module.exports.delete = async (req, res) => {
	try {
		const userId = req.params.id;

		// Vérifier si l'utilisateur existe avant la suppression
		const existingUser = await authModel.findById(userId);

		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Supprimer l'avatar de Cloudinary si celui-ci existe
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);
		}

		// Supprimer l'utilisateur de la base de données
		await authModel.findByIdAndDelete(userId);

		res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur." });
	}
};

// Fonction pour récupérer tous les utilisateurs (accessible seulement par l'administrateur)
module.exports.getAllUsers = async (req, res) => {
	try {
		// Vérifier s'il s'agit d'un utilisateur admin
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message: 'Accès non autorisé. Seuls les admins peuvent effectuer cette action.',
			});
		}

		// Récupérer tous les utilisateurs depuis la base de données
		const users = await authModel.find();

		// Retourner la liste des utilisateurs
		res.status(200).json({ users });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
	}
};

// Fonction pour récupérer un utilisateur par son id (accessible seulement par l'administrateur)
module.exports.getUserById = async (req, res) => {
	try {
		// Vérifier s'il s'agit d'un utilisateur admin
		if (req.user.role !== 'admin') {
			return res
				.status(403)
				.json({
					message: 'Accès non autorisé. Seuls les admins peuvent effectuer cette action.',
				});
		}

		// Récupérer l'ID de l'utilisateur depuis les paramètres de la route
		const userId = req.params.id;

		// Vérifier si l'utilisateur existe dans la base de données
		const user = await authModel.findById(userId);

		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé.' });
		}

		// Retourner les informations de l'utilisateur
		res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
	}
};
