// Import de mongoose
const mongoose = require('mongoose');
// Import de supertest
const request = require('supertest');
// Import de l'application
const app = require('../server');
// Import du JWT
const jwt = require('jsonwebtoken');
// Import du model
const authModel = require('../models/auth.model');

// Mock de la méthode destroy de cloudinary pour éviter de supprimer réélement les fichier lors des tests
jest.mock('cloudinary');

// Connexion à la base de données avant l'execution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect
	await mongoose.connect(process.env.MONGO_URI);
	// Atente d'une seconde pour assurer la connexion avec la bdd
	await new Promise((resolve) => setTimeout(resolve), 1000);
});
// Fermeture de la connexion après execution des tests
afterAll(async () => {
	// Utilisation de la méthode close
	await mongoose.connection.close();
});

// fonction utilitaire pour générer un token d'authentification
function generateAuthToken(user) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de jwt pour générer le token
	return jwt.sign({ userId: user._id }, secretKey, { expiresIn });
}

// Bloc de test pour la route de mis à jour du profil
describe('Update Profile API', () => {
	it('Should update the user profile', async () => {
		// Entrer l'utilisateur existant en base de données (id)
		const existingUserId = '65af7daed7a709bd211607c8';
		const existingUser = await authModel.findById(existingUserId);

		expect(existingUser).toBeDefined();

		// Générer un token
		const authToken = generateAuthToken(existingUser);

		// Utiliser supertest pour envoyer une requête PUT
		const response = await request(app)
			.put(`/api/update/${existingUserId}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'NouveauNom',
				firstname: 'NouveauPrenom',
				birthday: '1995-01-01',
				address: 'Nouvelle adresse',
				zipcode: '62587',
				city: 'Loly ville',
				phone: '0608070905',
				email: 'fournier@gmail.com',
			});
		// Afficher le corps de la réponse en cas d'echec
		if (response.status !== 200) {
			console.error(response.body);
		}
		// S'assurer que la réponse est 200
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Utilisateur mis à jour avec succès');
		expect(response.body).toHaveProperty('user');
	});
});
