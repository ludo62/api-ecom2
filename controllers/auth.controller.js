// Import du model auth
const authModel = require('../models/auth.model');
// Import de la validation des données
const { validationResult } = require('express-validator');
// Import du modèle de hachage bcrypt
const bcrypt = require('bcryptjs');
// Import du module jwt pour les tokens
const jwt = require('jsonwebtoken');
// Import du mudule cloudinary
const cloudinary = require('cloudinary').v2;
// Import de nodemailer pour l'envoie de mail
const nodemailer = require('nodemailer');
// Import de cryto pour la génération de token
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
	host: 'sandbox.smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: process.env.MAILTRAP_USER,
		pass: process.env.MAILTRAP_PASS,
	},
});
// Déclaration de variable pour générer un token email avec crypto
const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString('hex');
};
// Déclaration de variable pour générer un token password avec crypto
const generateVerificationTokenPassword = () => {
	return crypto.randomBytes(32).toString('hex');
};
// fonction de vérification de l'envoi email
const sendVerificationEmail = async (to, verificationToken) => {
	// Variable qui va contenir le lien de vérification
	const verificationLink = `http://localhost:5000/verify?token=${verificationToken}`;

	const mailOptions = {
		from: 'verificationemail@gmail.com',
		to,
		subject: 'Veuillez vérifier votre adresse email',
		text: `Merci de vérifier votre email en cliquant sur ce <a href=${verificationLink}>Lien</a>`,
		html: `<p>Merci de cliquer sur le lien pour verifier votre adresse mail et pouvoir vous connecter</p>`,
	};

	await transporter.sendMail(mailOptions);
};
// fonction de vérification pour la réinitialisation du mot de passe
const sendResetPassword = async (to, resetPasswordToken) => {
	// Variable qui va contenir le lien de vérification
	const resetPasswordLink = `http://localhost:5000/forgot-password?token=${resetPasswordToken}`;

	const mailOptions = {
		from: 'forgot-password@gmail.com',
		to,
		subject: 'Réinitialisation du mot de passe',
		text: `Réinitialisation de votre mot de passe en cliquant sur ce <a href=${resetPasswordLink}>Lien</a>`,
		html: `<p>Merci de cliquer sur le lien pour Réinitialiser votre mot de passe</p>`,
	};

	await transporter.sendMail(mailOptions);
};
// Fonction pour l'inscription
module.exports.register = async (req, res) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { lastname, firstname, birthday, address, zipcode, city, phone, email, password } =
			req.body;

		// Vérifier si une image est téléchargée
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}

		// Vérifier si l'email existe déjà dans la table auth
		const existingAuth = await authModel.findOne({ email });

		if (existingAuth) {
			// supprimer l'image téléchargée si elle existe
			if (req.file && req.file.public_id) {
				await cloudinary.uploader.destroy(req.file.public_id);
				console.log("L'image a été supprimée car l'email existe déjà");
			}
			return res.status(400).json({
				message: 'Votre email existe déjà en base de données. Veuillez en choisir un autre',
			});
		}

		// Utilisation de l'url de cloudinary et du public_id provenant du middleware
		const avatarUrl = req.cloudinaryUrl;
		const avatarPublicId = req.file.public_id;

		// Créer un nouvel utilisateur dans la table auth
		const auth = await authModel.create({
			lastname,
			firstname,
			birthday,
			address,
			zipcode,
			city,
			phone,
			email,
			password,
			avatarUrl,
			avatarPublicId,
		});

		// Génaration de la vérification de token sécurisé
		const verificationToken = generateVerificationToken();

		// Sauvegarder le token générer dans la bdd et l'associé à l'utilisateur
		auth.emailVerificationToken = verificationToken;
		auth.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

		// Sauvegarder
		await auth.save();

		// Envoyer la vérification d'email
		await sendVerificationEmail(auth.email, verificationToken);

		res.status(201).json({
			message: 'Utilisateur créé avec succès. Vérifiez votre email pour activer votre compte',
			auth,
		});
	} catch (error) {
		console.error("Erreur lors de l'enregistrement de l'utilisateur : ", error.message);

		// supprimer l'image téléchargée si elle existe
		if (req.file && req.file.public_id) {
			await cloudinary.uploader.destroy(req.file.public_id);
			console.log("L'image a été supprimée car la requête est invalide");
		}
		res.status(500).json({ message: "Erreur lors de l'enregistrement de l'utilisateur" });
	}
};
// Fonction pour la vérification email
module.exports.verifyEmail = async (req, res) => {
	try {
		// Récupération du tken pour le mettre en paramètre d'url
		const { token } = req.params;

		// Trouver l'utilisateur avec le token associé
		const user = await authModel.findOne({ emailVerificationToken: token });

		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé ou token invalide' });
		}

		// Vérifier si le token n'a pas expiré
		if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < Date.now()) {
			console.log("Date d'expiration du token :", user.emailVerificationTokenExpires);
			console.log('Date actuelle :', new Date(Date.now()));
			return res.status(400).json({ message: 'Le token à expiré' });
		}

		// Mette à jour isEmailVerified à true et sauvegarder
		user.isEmailVerified = true;
		// Effacer le token après vérification
		user.emailVerificationToken = undefined;
		// Effacer la date d'expiration
		user.emailVerificationTokenExpires = undefined;
		// Sauvegarder
		await user.save();

		// Message de réussite
		res.status(200).json({ message: 'Email vérifié avec succès' });
	} catch (error) {
		console.error("Erreur lors de la vérification de l'email : ", error.message);
		res.status(500).json({ message: "Erreur lors de la vérification de l'email" });
	}
};
// fonction pour la demande de réinitialisation de mot de passe par email
module.exports.forgotPassword = async (req, res) => {
	try {
		// Email que l'on va devoir entrer dans Postman pour recevoir l'e-mail
		const { email } = req.body;

		// Rechercher l'utilisateur par e-mail
		const user = await authModel.findOne({ email });

		// Condition si aucun utilisateur n'est trouvé avec cet e-mail
		if (!user) {
			return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet e-mail' });
		}

		// Générer un token de réinitialisation de mot de passe sécurisé
		const resetPasswordToken = generateVerificationTokenPassword();

		// Enregistrer le token de réinitialisation de mot de passe et l'expiration dans la BDD
		user.resetPasswordToken = resetPasswordToken;
		user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
		await user.save();

		// Envoyer un e-mail avec le lien de réinitialisation de mot de passe
		await sendResetPassword(user.email, resetPasswordToken);

		// Message de réussite
		res.status(200).json({
			message:
				'Un email de réinitialisation de mot de passe à été envoyé sur votre adresse email',
		});
	} catch (error) {
		console.error(
			'Erreur lors de la demande de réinitialisation de mot de passe',
			error.message
		);
		res.status(500).json({
			message: 'Erreur lors de la demande de réinitialisation de mot de passe',
		});
	}
};

// Fonction pour réinitialiser le mot de passe
module.exports.updatePassword = async (req, res) => {
	try {
		// Récupération du token pour le mettre en params url
		const { token } = req.params;
		// Ajout de deux nouveaux champs dans la requête
		const { newPassword, confirmNewPassword } = req.body;

		// Vérifier si les champs de mot de passe correspondent
		if (newPassword !== confirmNewPassword) {
			return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
		}

		// Trouver l'utilisateur par le token de reinitialisation de mot de passe
		const user = await authModel.findOne({
			resetPasswordToken: token,
			resetPasswordTokenExpires: { $gt: Date.now() },
		});

		// Vérifier si le token est valide
		if (!user) {
			return res
				.status(400)
				.json({ message: 'token de réinitialisation invalide ou expiré' });
		}
		// Mettre à jour le mot de passe
		user.password = newPassword;
		// Réinitialiser le token et l'expiration
		user.resetPasswordToken = undefined;
		user.resetPasswordTokenExpires = undefined;
		// Enregistrer les modifications
		await user.save();

		// envoyer une réponse de succès
		res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
	} catch (error) {
		console.error('Erreur lors de la réinitialisation du mot de passe', error.message);
		res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
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
// Fontion pour voir mon profil
module.exports.getProfile = async (req, res) => {
	try {
		// Récuperer l'id de l'utilisateur
		const userId = req.params.id;

		// Vérifier si l'utilisateur existe en base de données
		const user = await authModel.findById(userId);

		// Condition si l'utilisateur n'est pas en bdd
		if (!user) {
			return res.status(404).json({ message: "Le profil n'a pas été trouvé" });
		}
		// Message de réussite
		res.status(200).json({ message: 'profil récupéré', user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la recupération du profil' });
	}
};
// Fonction pour la modification du profil
module.exports.update = async (req, res) => {
	try {
		// Déclaration de variables pour la gestion des erreurs de validations
		const errors = validationResult(req);

		// Verification si il y a des erreurs
		if (!errors.isEmpty) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Recupération de l'id de l'utilisateur pour le mettre en param de requête
		const userId = req.params.id;

		// Récupération des données du formulaire
		const { lastname, firstname, birthday, address, zipcode, city, phone, email, newPassword } =
			req.body;

		// Vérifier si l'utilisateur existe avant la mise à jour
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en base de données
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		// Vérifier si une nouvelle image est téléchargée, mettre à jour le chemin de l'image
		if (req.file) {
			// Supprimer l'ancienne image si il y a une
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
			// Redonne une nouvelle url et un nouvel id a l'image
			existingUser.avatarUrl = req.cloudinaryUrl;
			existingUser.avatarPublicId = req.file.public_id;
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

		// Mettre à jour le mot de passe uniquement si fourni dans la requête
		if (newPassword) {
			existingUser.password = newPassword;
		}

		// Sauvegarder les modifications
		await existingUser.save();

		// Code de reussite avec log
		res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user: existingUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la mis à jour du profil utilisateur' });
	}
};
// fonction pour la suppression d'un profil
module.exports.delete = async (req, res) => {
	try {
		// Déclaration de la variable qui va rechercher l'id utilisateur pour le mettre en params url
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier si l'utilisateur existe
		const existingUser = await authModel.findById(userId);

		// Suppresion de l'avatar de cloudinary si celui ci existe
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);
		}

		// Supprimer l'utilisateur de la base de données
		await authModel.findByIdAndDelete(userId);

		// Message de réussite
		res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
	}
};
// fonction pour accéder a une route protégée (admin)
module.exports.dashboard = async (req, res) => {
	try {
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
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la connexion' });
	}
};
// Fonction pour aller voir tous les utilisateurs (admin)
module.exports.getAllUsers = async (req, res) => {
	try {
		// Verifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut voir tous les utilisateurs',
			});
		}
		const users = await authModel.find();

		res.status(200).json({ message: 'Liste des utilisateurs', users });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la recupération des utilisateurs' });
	}
};
// fonction pour aller voir un utilisateur (admin)
module.exports.getUserById = async (req, res) => {
	try {
		// Verifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut voir un profil utilisateur',
			});
		}

		// Récuperer l'id de l'utilisateur
		const userId = req.params.id;

		// Vérifier si l'utilisateur existe en base de données
		const user = await authModel.findById(userId);

		// Condition si l'utilisateur n'est pas en bdd
		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}
		// Message de réussite
		res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la recupération de l'utilisateur" });
	}
};
// fonction pour modifier un utilisateur (admin)
module.exports.updateUser = async (req, res) => {
	try {
		// Verifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut modifier un profil' });
		}
		// Déclaration de variables pour la gestion des erreurs de validations
		const errors = validationResult(req);

		// Verification si il y a des erreurs
		if (!errors.isEmpty) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Recupération de l'id de l'utilisateur pour le mettre en param de requête
		const userId = req.params.id;

		// Récupération des données du formulaire
		const { lastname, firstname, birthday, address, zipcode, city, phone, email } = req.body;

		// Vérifier si l'utilisateur existe avant la mise à jour
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en base de données
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		// Vérifier si une nouvelle image est téléchargée, mettre à jour le chemin de l'image
		if (req.file) {
			// Supprimer l'ancienne image si il y a une
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
			// Redonne une nouvelle url et un nouvel id a l'image
			existingUser.avatarUrl = req.cloudinaryUrl;
			existingUser.avatarPublicId = req.file.public_id;
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

		// Code de reussite avec log
		res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user: existingUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la mis à jour du profil utilisateur' });
	}
};
// Fonction pour supprimer un utilisateur (admin)
module.exports.deleteUser = async (req, res) => {
	try {
		// Verifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut supprimer un profil' });
		}
		// Déclaration de la variable qui va rechercher l'id utilisateur pour le mettre en params url
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier si l'utilisateur existe
		const existingUser = await authModel.findById(userId);

		// Suppresion de l'avatar de cloudinary si celui ci existe
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);
		}

		// Supprimer l'utilisateur de la base de données
		await authModel.findByIdAndDelete(userId);

		// Message de réussite
		res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
	}
};
