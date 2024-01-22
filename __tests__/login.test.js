// Importations nécessaires
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

describe('Login API', () => {
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

	// Test vérifiant que la route renvoie un token si la connexion réussit
	it('Should return a token if login succeeds', async () => {
		// On suppose que nous avons un utilisateur en base de données
		const existingUser = {
			_id: new mongoose.Types.ObjectId(),
			email: 'exemple@gmail.com',
			password: await bcrypt.hash('123456', 10),
		};
		// Simulation de la méthode findOne pour renvoyer l'utilisateur existant lorsqu'elle est appelée
		jest.spyOn(authModel, 'findOne').mockResolvedValue(existingUser);

		// Effectuer la requête de connexion à la route /api/login
		const response = await request(app).post('/api/login').send({
			email: 'exemple@gmail.com',
			password: '123456',
		});

		// Vérifier que la réponse est réussie
		expect(response.status).toBe(200);

		// Vérifier que la réponse contient un token
		expect(response.body).toHaveProperty('token');

		// Décoder le token pour vérifier son contenu
		const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);

		// Vérifier que le token contient les informations attendues
		expect(decodedToken).toHaveProperty('user');
		expect(decodedToken.user).toHaveProperty('id', existingUser._id.toHexString());
		expect(decodedToken.user).toHaveProperty('email', existingUser.email);
	});
});
