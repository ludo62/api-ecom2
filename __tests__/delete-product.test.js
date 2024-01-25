const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const productModel = require('../models/product.model');

// Fonction utilitaire pour générer un jeton d'authentification
function generateAuthToken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de la bibliothèque jsonwebtoken pour générer le jeton
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

// Votre test pour supprimer un produit par ID
describe('Delete Product API', () => {
	it('Should allow deleting product for admin', async () => {
		// ID de l'utilisateur admin dans la base de données
		const adminUserId = '65afa2a85bd581f923d141b8';

		// ID du produit à supprimer
		const productIdToDelete = '65b0f2db18e199dea0e30286';

		// Générer un jeton d'authentification pour l'admin
		const authToken = generateAuthToken(adminUserId);

		// Faire la demande pour supprimer un produit par ID
		const response = await request(app)
			.delete(`/api/delete-product/${productIdToDelete}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse
		console.log(response.body);

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Produit supprimé avec succès');

		// S'assurer que les informations du produit ont bien été supprimées de la base de données
		const deletedProduct = await productModel.findById(productIdToDelete);
		expect(deletedProduct).toBeNull();
	});
});
