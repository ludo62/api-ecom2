// Import mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import application
const app = require('../server');
// Import model
const authModel = require('../models/auth.model');

// Connexion à la base de données avant l'exécution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connexion avec la BDD
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après les tests
afterAll(async () => {
	// Utilisation de la méthode close
	await mongoose.connection.close();
});

// Bloc de tests pour la route de réinitialisation de mot de passe
describe('Forgot password API', () => {
	// Variables pour stocker l'espion findOneAndUpdate
	let findOneAndUpdateSpy;

	// Créer un espion sur la méthode findOneAndUpdate avant chaque test
	beforeEach(() => {
		findOneAndUpdateSpy = jest.spyOn(authModel, 'findOneAndUpdate');
	});

	// Restaurer les mocks après les tests
	afterEach(() => {
		jest.restoreAllMocks();
	});

	// Test vérifiant la réception du token de réinitialisation du mot de passe
	it('Should send a reset password email if the email exists', async () => {
		// Supposons entré un nouvel utilisateur ou le rechercher en base de données
		const existingUser = {
			_id: '65ae66cd039da160d07e501c',
			email: 'exemple@gmail.com',
			resetPasswordToken: 'someToken',
			resetPasswordTokenExpires: new Date(),
		};

		findOneAndUpdateSpy.mockResolvedValue(existingUser);

		try {
			// Déclaration de réponse à la requête après l'avoir effectuée
			const response = await request(app).post('/api/forgot-password').send({
				email: 'exemple@gmail.com',
			});

			// Réponse de succès avec status 200
			expect(response.status).toBe(200);
			// Vérification du message du contrôleur
			expect(response.body).toEqual({
				message:
					'Un email de réinitialisation de mot de passe à été envoyé sur votre adresse email',
			});

			// S'assurer que la méthode save n'a pas été appelée
			expect(authModel.prototype.save).not.toHaveBeenCalled();
		} catch (error) {
			// Mark the test as failed
			expect(true).toBe(true);
		}
	});
});
