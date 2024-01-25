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

// Votre test pour récupérer un utilisateur par ID
describe('Update product API', () => {
	it('Should allow updating product for admin', async () => {
		// ID de l'utilisateur admin dans la base de données
		const adminUserId = '65afa2a85bd581f923d141b8';

		// ID de l'utilisateur à récupérer
		const productIdToUpdate = '65b0e8f205f8c5337feb58aa';

		// Générer un jeton d'authentification pour l'admin
		const authToken = generateAuthToken(adminUserId);

		// Faire la demande pour récupérer un utilisateur par ID
		const response = await request(app)
			.put(`/api/update-product/${productIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				title: 'chaussures2',
				description: 'Chaussures pour enfants 2',
				price: '21.90',
			});

		// Log de la réponse
		console.log(response.body);

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Produit modifié avec succès');
		expect(response.body).toHaveProperty('product');

		// S'assurer que les information de l'utilisateur ont bien été mis à jour
		const updateProduct = await productModel.findById(productIdToUpdate);
		expect(updateProduct.title).toBe('chaussures2');
		expect(updateProduct.description).toBe('Chaussures pour enfants 2');
		expect(updateProduct.price).toBe(21.9);
	});
});
