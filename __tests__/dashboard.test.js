// __tests__/dashboard.test.js

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

// Fonction utilitaire pour générer un jeton d'authentification
function generateAuthToken(userId, role) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de la bibliothèque jsonwebtoken pour générer le jeton
	return jwt.sign({ userId, role }, secretKey, { expiresIn });
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

// Votre test pour accéder au dashboard en tant qu'admin
describe('Dashboard API', () => {
	it('Should allow access to the dashboard for admin', async () => {
		// ID de l'utilisateur admin dans la base de données
		const adminUserId = '65afa2a85bd581f923d141b8';

		// Générer un jeton d'authentification pour l'admin
		const authToken = generateAuthToken(adminUserId, 'admin');

		// Faire la demande pour accéder au dashboard
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);

		console.log(response.body); // Log de la réponse

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Bienvenue Admin');
	});

	it('Should return an error for non-admin users trying to access the dashboard', async () => {
		// ID de l'utilisateur non-admin dans la base de données
		const nonAdminUserId = '65af7daed7a709bd211607c8';

		// Générer un jeton d'authentification pour l'utilisateur non-admin
		const authToken = generateAuthToken(nonAdminUserId, 'user');

		// Faire la demande pour accéder au dashboard en tant qu'utilisateur non-admin
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);

		console.log(response.body); // Log de la réponse

		// Assurez-vous que la demande est refusée (403)
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty(
			'message',
			'Action non autorisée, seuls les admin peuvent acceder à cette page'
		);
	});
});
