// Import mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import application
const app = require('../server');
// Import model
const authModel = require('../models/auth.model');

// Connexion à la base de données avant execution des tests
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

		// Déclaration de réponse a la requête après l'avoir éffectué
		const response = await request(app).post('/api/forgot-password').send({
			email: 'exemple@gmail.com',
		});
		// Ajout de logs pour voir si findOneAndUpdate est appelé
		console.log('findOneAndUpdateSpy calls:', findOneAndUpdateSpy.mocks.calls);

		// Réponse de succès avec status 200
		expect(response.status).toBe(200);
		// Vérification du message du controlleur
		expect(response.body).toEqual({
			message:
				'Un email de réinitialisation de mot de passe à été envoyé sur votre adresse email',
		});
		// Vérifier si findOneAndUpdate est appelé avec le bon email et le bon update
		expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
			{ email: 'exemple@gmail.com' },
			{
				resetPasswordToken: expect.any(String),
				resetPasswordTokenExpires: expect.any(Date),
			},
			{ new: true }
		);
		// S'assurer que la méthode save n'a pas été appelée
		expect(authModel.prototype.save).not.toHaveBeenCalled();
	});
});
