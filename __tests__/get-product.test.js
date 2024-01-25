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

// Votre test pour récupérer un produit par ID
describe('Get product By ID API', () => {
	it('Should get a specific products by ID', async () => {
		// ID du produit à récupérer
		const productIdToGet = '65b0f2db18e199dea0e30286';

		// Faire la demande pour récupérer un produit par ID
		const response = await request(app).get(`/api/product/${productIdToGet}`);

		// Log de la réponse
		console.log(response.body);

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('product');
	});
});
