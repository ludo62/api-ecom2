// Importation de mongoose
const mongoose = require('mongoose');
// Importation de supertest
const request = require('supertest');
// Importation de l'application
const app = require('../server');
// Importation du model
const authModel = require('../models/auth.model');

// Connexion à la base de données avant l'exécution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connexion
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après l'exécution des tests
afterAll(async () => {
	// Utilisation de la méthode close
	await mongoose.connection.close();
});

// Blocs de tests pour la route update-password
describe('Testing route /api/update-password/:token', () => {
	// Variables pour stocker le token de réinitialisation
	let resetPasswordToken;

	// Avant tous les tests, récupérer un utilisateur avec un token valide dans la base de données
	beforeAll(async () => {
		const user = await authModel.findOne({
			email: 'exemple@gmail.com',
		});
		// Vérification de l'utilisateur
		if (user) {
			resetPasswordToken = user.resetPasswordToken;
		}
	});

	// Test vérifiant que la route renvoie un code 400 si les mots de passe ne correspondent pas
	it('Should return status code 400 if passwords do not match', async () => {
		const response = await request(app).put(`/api/update-password/${resetPasswordToken}`).send({
			newPassword: 'newPassword',
			confirmNewPassword: 'differentPassword',
		});
		// Vérifie que la réponse attendue est 400
		expect(response.status).toBe(400);
	});

	// Test vérifiant que la route renvoie un code 400 si le token de réinitialisation est invalide
	it('Should return status code 400 if reset password token is invalid', async () => {
		const response = await request(app).put('/api/update-password/invalid-token').send({
			newPassword: 'newPassword',
			confirmNewPassword: 'newPassword',
		});
		// Vérifie que la réponse attendue est 400
		expect(response.status).toBe(400);
	});

	// Test vérifiant que la route renvoie un code 200 si le mot de passe est réinitialisé avec succès
	it('Should return status code 200 if password is successfully reset', async () => {
		// S'assurer que resetPasswordToken est défini avant ce test
		console.log('Reset Password Token:', resetPasswordToken); // Ajout de ce log
		if (resetPasswordToken) {
			const response = await request(app)
				.put(`/api/update-password/${resetPasswordToken}`)
				.send({
					newPassword: '123456789',
					confirmNewPassword: '123456789',
				});
			// Vérifier que la réponse à un code 200
			console.log('Response:', response.body); // Ajout de ce log
			expect(response.status).toBe(200);
		}
	});
});
