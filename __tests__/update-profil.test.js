const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server'); // Assurez-vous que c'est le bon chemin vers votre fichier d'application
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

// Mock de la méthode destroy de Cloudinary pour éviter de réellement supprimer des fichiers lors des tests
jest.mock('cloudinary');

// Connexion à la base de données avant l'exécution des tests
beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI);
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après l'exécution des tests
afterAll(async () => {
	await mongoose.connection.close();
});

// Fonction utilitaire pour générer un jeton d'authentification
function generateAuthToken(user) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de la bibliothèque jsonwebtoken pour générer le jeton
	return jwt.sign({ userId: user._id }, secretKey, { expiresIn });
}

// Bloc de tests pour la route de mise à jour du profil
describe('Update Profile API', () => {
	it('Should update the user profile', async () => {
		// Assumez que vous avez un utilisateur existant en base de données avec l'ID spécifié
		const existingUserId = '65aea245b30543eaf4b02c58';
		const existingUser = await authModel.findById(existingUserId);

		expect(existingUser).toBeDefined();

		// Générez un jeton d'authentification pour l'utilisateur
		const authToken = generateAuthToken(existingUser);

		// Utilisez Supertest pour envoyer une requête PUT pour mettre à jour le profil
		const response = await request(app)
			.put(`/api/update/${existingUserId}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'NewLastName',
				firstname: 'NewFirstName',
				birthday: '1995-01-01',
				address: 'New Address',
				zipcode: '12345',
				city: 'New City',
				phone: '1234567890',
				email: 'newemail@example.com',
			});

		// Affichez le corps de la réponse en cas d'échec
		if (response.status !== 200) {
			console.error(response.body);
		}

		// Assurez-vous que la réponse est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Utilisateur mis à jour avec succès');
		expect(response.body).toHaveProperty('user');
	});
});
