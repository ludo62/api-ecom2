// Import du module supertest
const request = require('supertest');
// Import du module mongoose
const mongoose = require('mongoose');
// Import de l'application
const app = require('../server');
// Import de path
const path = require('path');

// Connexion à la base de données avant l'execution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d"une seconde pour assurer la connexion à la base de données
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion  après execution des test
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour fermer la connexion
	await mongoose.connection.close();
});

// Bloc de tests pour la route d'inscription
describe('Register route testing', () => {
	// Tests spécifique pour la création d'un utilisateur
	it("devrait retourner 201 si l'utilisateur est crée", async () => {
		// Utilisation de supertest pour envoyer une requête
		const response = await request(app)
			.post('/api/register')
			// Remplissage des champs du formulaire
			.field('lastname', 'Fournier')
			.field('firstname', 'Ludovic')
			.field('birthday', '16-05-2000')
			.field('address', '31 comme Vanessa penche toi et tousse')
			.field('zipcode', '62152')
			.field('city', 'Boul')
			.field('phone', '0607080910')
			.field('email', 'exemple@gmail.com')
			.field('password', '123456')
			// Attache un fichier à la requête (exemple image)
			.attach('image', path.resolve(__dirname, '../image/téléchargement.jpeg'));

		// Affichage de la réponse reçue dans la console
		console.log('Réponse reçue', response.body);

		// Assertion vérifiant que le status de la réponse est 200
		expect(response.status).toBe(201);

		// Assertion vérifiant que la propriété message contient le message attendu
		expect(response.body).toHaveProperty(
			'message',
			'Utilisateur créé avec succès. Vérifiez votre email pour activer votre compte'
		);
	});
});
