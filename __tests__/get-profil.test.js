// Import de mongoose
const mongoose = require('mongoose');
// Import de supertest
const request = require('supertest');
// Import de l'application
const app = require('../server');
const { login } = require('../controllers/auth.controller');

// Bloc de test pour verifier la route /api/profile/:id
describe('Get Profile API', () => {
	// Connexion à la base de données avant execution des test
	beforeAll(async () => {
		// Utilisation de la méthode connect
		await mongoose.connect(process.env.MONGO_URI);
		// Attente d'une seconde pour assurer la connexion à la bdd
		await new Promise((resolve) => setTimeout(resolve), 1000);
	});
	// Deconnection bdd après execution des tests
	afterAll(async () => {
		// Utilisation de la méthode close
		await mongoose.connection.close();
	});
	// Test vérifiant que la route /api/profile/:id renvoie le profil de l'utilisateur connecté (connexion)
	it('Should return profile of the authenticated user', async () => {
		// Effceuter la connexion et récupérer le token
		const loginResponse = await request(app).post('/api/login').send({
			email: 'exemple@gmail.com',
			password: '123456789',
		});
		// Vérifier que la connexion est réussie
		expect(loginResponse.status).toBe(200);
		expect(loginResponse.body).toHaveProperty('token');

		// Récuperer le token pour le test suivant
		const authToken = loginResponse.body.token;

		// Déclaration variable utilisateur avec son id
		const userId = '65af7daed7a709bd211607c8';

		// Test pour vérifier que la route /api/profile/:id renvoie le profil de l'utilisateur connecté
		const responseProfil = await request(app)
			.get(`/api/profile/${userId}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Vérifier que la réponse est réussie
		expect(responseProfil.status).toBe(200);

		// Afficher l'utilisateur dans la console
		console.log('Utilisateur récupére:', responseProfil.body.user);
	});
});
