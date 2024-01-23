// __tests__/get-all-users.test.js

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

// Fonction utilitaire pour générer un jeton d'authentification
function generateAuthToken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de la bibliothèque jsonwebtoken pour générer le jeton
	return jwt.sign({ userId }, secretKey, { expiresIn });
}

// Connexion à la base de données avant l'exécution des tests
beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI);
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après l'exécution des tests
afterAll(async () => {
	await mongoose.connection.close();
});

// Votre test pour récupérer tous les utilisateurs
describe('Get All Users API', () => {
	it('Should get all users if admin is authenticated', async () => {
		// ID de l'utilisateur admin dans la base de données
		const adminUserId = '65afa2a85bd581f923d141b8';

		// Générer un jeton d'authentification pour l'admin
		const authToken = generateAuthToken(adminUserId);

		// Faire la demande pour récupérer tous les utilisateurs
		const response = await request(app)
			.get('/api/users')
			.set('Authorization', `Bearer ${authToken}`);

		console.log(response.body); // Log de la réponse

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Liste des utilisateurs');
		expect(response.body).toHaveProperty('users');
	});
});
