// __tests__/get-user-by-id.test.js

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

// Votre test pour récupérer un utilisateur par ID
describe('Get User By ID API', () => {
	it('Should get a specific user by ID if admin is authenticated', async () => {
		// ID de l'utilisateur admin dans la base de données
		const adminUserId = '65afa2a85bd581f923d141b8';

		// ID de l'utilisateur à récupérer
		const userIdToGet = '65af7daed7a709bd211607c8';

		// Générer un jeton d'authentification pour l'admin
		const authToken = generateAuthToken(adminUserId);

		// Faire la demande pour récupérer un utilisateur par ID
		const response = await request(app)
			.get(`/api/user/${userIdToGet}`)
			.set('Authorization', `Bearer ${authToken}`);

		console.log(response.body); // Log de la réponse

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('user');
		// Vous pouvez ajouter d'autres assertions en fonction de la structure de votre réponse
	});
});
