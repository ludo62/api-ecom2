// Importations nécessaires
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');

describe('Get Profile API', () => {
	// Avant tous les tests
	beforeAll(async () => {
		// Connexion à la base de données et autres initialisations
		await mongoose.connect(process.env.MONGO_URI);
		await new Promise((resolve) => setTimeout(resolve, 1000));
	});

	// Après tous les tests
	afterAll(async () => {
		// Fermeture de la connexion à la base de données
		await mongoose.connection.close();
	});

	// Test vérifiant que la route /api/profile/:id renvoie le profil de l'utilisateur connecté
	it('Should return the profile of the authenticated user', async () => {
		// Effectuer la connexion et récupérer le token
		const loginResponse = await request(app).post('/api/login').send({
			email: 'exemple@gmail.com',
			password: '123456789',
		});

		// Vérifier que la connexion est réussie
		expect(loginResponse.status).toBe(200);
		expect(loginResponse.body).toHaveProperty('token');

		// Récupérer le token pour le test suivant
		const authToken = loginResponse.body.token;

		// Remplacez 'user-id' par l'ID réel de l'utilisateur dans la base de données
		const userId = '65aea245b30543eaf4b02c58';

		// Test pour vérifier que la route /api/profile/:id renvoie le profil de l'utilisateur connecté
		const responseProfile = await request(app)
			.get(`/api/profile/${userId}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Vérifier que la réponse est réussie
		expect(responseProfile.status).toBe(200);

		// Afficher l'utilisateur dans la console
		console.log('Utilisateur récupéré :', responseProfile.body.user);
	});
});
