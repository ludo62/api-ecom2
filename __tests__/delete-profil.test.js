const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');
const cloudinary = require('cloudinary').v2;

// Mock de la méthode destroy de Cloudinary pour éviter de réellement supprimer des fichiers lors des tests
jest.mock('cloudinary');

// Fonction utilitaire pour générer un jeton d'authentification
function generateAuthToken(userId) {
	// Clé secrète utilisée pour signer le jeton
	const secretKey = process.env.JWT_SECRET;

	// Durée de validité du jeton (1 heure dans cet exemple)
	const expiresIn = '1h';

	// Utilisation de jsonwebtoken pour générer le jeton
	return jwt.sign({ userId }, secretKey, { expiresIn });
}

// Connexion à la base de données avant l'exécution des tests
beforeAll(async () => {
	// Connexion à la base de données MongoDB spécifiée dans l'environnement
	await mongoose.connect(process.env.MONGO_URI);

	// Attendre pendant 1 seconde pour permettre la connexion
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après l'exécution des tests
afterAll(async () => {
	// Fermeture de la connexion à la base de données après les tests
	await mongoose.connection.close();
});

// Bloc de tests pour la route de suppression de profil
describe('Delete Profile API', () => {
	it('Should delete the user profile', async () => {
		// ID de l'utilisateur à supprimer (remplacez ceci par l'ID réel)
		const userIdToDelete = '65aea245b30543eaf4b02c58';

		// Générer un jeton d'authentification pour l'utilisateur à supprimer
		const authToken = generateAuthToken(userIdToDelete);

		// Faire la demande pour supprimer le profil de l'utilisateur
		const response = await request(app)
			.delete(`/api/delete/${userIdToDelete}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse de la requête HTTP
		console.log(response.body);

		// Assurez-vous que la suppression a réussi (statut 200)
		expect(response.status).toBe(200);

		// Vérifiez également que l'utilisateur a été supprimé de la base de données
		const deletedUser = await authModel.findById(userIdToDelete);
		expect(deletedUser).toBeNull();
	});
});
