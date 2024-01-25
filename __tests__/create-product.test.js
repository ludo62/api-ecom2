// Import mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import de l'application
const app = require('../server');
// Import jwt
const jwt = require('jsonwebtoken');
// Import de path
const path = require('path');

// Fonction utilitaire pour générer un token
function generateAuthtoken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	return jwt.sign({ user: { id: userId } }, secretKey, { expiresIn });
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

// bloc de test pour créer un produit avec le role admin
describe('Create Product API', () => {
	it('should create product if role is admin', async () => {
		// Déclaration de variable qui contient l'id de l'admin
		const adminIdToCreate = '65afa2a85bd581f923d141b8';

		// Générer un token pour l'admin
		const authToken = generateAuthtoken(adminIdToCreate);

		// Utilisation de supertest pour envoyer une requête
		const response = await request(app)
			.post('/api/create-product')
			// Remplissage des champs du formulaire
			.set('Authorization', `Bearer ${authToken}`)
			.field('title', 'Chaussures')
			.field('description', 'Chaussures pour enfants')
			.field('price', '19.90')
			.attach('image', path.resolve(__dirname, '../image/images.jpg'));

		// Log de la réponse
		console.log(response.body);

		// S'assurer que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Produit ajouté avec succès');
	});
});
