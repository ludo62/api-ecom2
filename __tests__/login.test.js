// Import mogoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import app
const app = require('../server');
// Import bcrypt
const bcrypt = require('bcryptjs');
// Import JWT
const jwt = require('jsonwebtoken');
// Import Model
const authModel = require('../models/auth.model');

// Connexion à la base de données avant execution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connexion avec la BDD
	await new Promise((resolve) => setTimeout(resolve), 1000);
});
// Fermeture de la connexion après les tests
afterAll(async () => {
	// Utilisation de la méthode close
	await mongoose.connection.close();
});

// Bloc de tests pour la route de connexion
describe('Login API', () => {
	// Test spécifique pour vérifier que la route renvoie un jwt en cas de connexion réussie
	it('Should return a token if login succeeds', async () => {
		// On suppose que nous avons un utilisateur en base de données
		const existingUser = {
			_id: new mongoose.Types.ObjectId(),
			email: 'exemple@gmail.com',
			// hachage du mot de passe pour simuler le stockage en bdd
			password: await bcrypt.hash('123456', 10),
		};
		// Simulation de la méthode findOne pour renvoyer l'utilisateur existant lorsqu'elle est appelée
		jest.spyOn(authModel, 'findOne').mockResolvedValue(existingUser);

		// Effectuer la requête de connexion a la route /api/login
		const response = await request(app).post('/api/login').send({
			email: 'exemple@gmail.com',
			// Fournir le mot de passe en clair pour la comparaison
			password: '123456',
		});
		// Verifier que la réponse est réussie
		expect(response.status).toBe(200);

		// Vérifier que la réponse contient un token
		expect(response.body).toHaveProperty('token');

		// Decoder le token pour vérifier son contenu
		const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);

		// Verifier que le token contient les informations attendues
		expect(decodedToken).toHaveProperty('user');
		expect(decodedToken.user).toHaveProperty('id', existingUser._id.toHexString());
		expect(decodedToken.user).toHaveProperty('email', existingUser.email);
	});
});
