const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

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
describe('Update User API', () => {
	it('Should allow updating user profile for admin', async () => {
		// ID de l'utilisateur admin dans la base de données
		const adminUserId = '65afa2a85bd581f923d141b8';

		// ID de l'utilisateur à récupérer
		const userIdToUpdate = '65b0ca9d52386c0ccd3126c3';

		// Générer un jeton d'authentification pour l'admin
		const authToken = generateAuthToken(adminUserId);

		// Faire la demande pour récupérer un utilisateur par ID
		const response = await request(app)
			.put(`/api/update-user/${userIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'NouveauNom2',
				firstname: 'NouveauPrenom2',
				birthday: '1995-01-01',
				address: 'NouvelleAdresse',
				zipcode: '62587',
				city: 'LolVille',
				phone: '0607080910',
				email: 'fournier2@gmail.com',
			});

		// Log de la réponse
		console.log(response.body);

		// Assurez-vous que la demande est réussie (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Utilisateur mis à jour avec succès');
		expect(response.body).toHaveProperty('user');

		// S'assurer que les information de l'utilisateur ont bien été mis à jour
		const updateUser = await authModel.findById(userIdToUpdate);
		expect(updateUser.lastname).toBe('NouveauNom2');
		expect(updateUser.firstname).toBe('NouveauPrenom2');
		expect(updateUser.birthday).toBe('1995-01-01');
		expect(updateUser.address).toBe('NouvelleAdresse');
		expect(updateUser.zipcode).toBe('62587');
		expect(updateUser.city).toBe('LolVille');
		expect(updateUser.phone).toBe('0607080910');
		expect(updateUser.email).toBe('fournier2@gmail.com');
	});
});
