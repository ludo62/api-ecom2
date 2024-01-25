const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');

// Connexion à la base de données avant l'exécution des tests
beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI);
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après l'exécution des tests
afterAll(async () => {
	await mongoose.connection.close();
});

// Votre test pour récupérer tous les produits
describe('Get All Products API', () => {
	it('Should get all products', async () => {
		// Faire la demande pour récupérer tous les produits
		const response = await request(app).get('/api/all-products');

		// Log de la réponse
		console.log(response.body);

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Liste des produits');
		expect(response.body).toHaveProperty('products');
	});
});
