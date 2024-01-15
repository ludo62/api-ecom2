// Chargements des variables d'environnement
require('dotenv').config();

// Import des modules necessaires
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import de cloudinary
const cloudinary = require('cloudinary').v2;

// Import des routes pour l'authentification
const authRoutes = require('./routes/auth.route');

// Import des routes pour la création des produits
const productRoutes = require('./routes/product.route');

// Import de la configuration de la base de données
const connectDB = require('./config/db');

// Initialisation de l'application Express
const app = express();

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Middleware pour parser les corps de requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration des options cors
const corsOptions = {
	origin: '*',
	credentials: true,
	optionsSuccessStatus: 200,
	methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
	preflightContinue: false,
};
// Middleware pour gerer les cors
app.use(cors(corsOptions));

// Utilisation des routes pour l'authentification
app.use('/api', authRoutes);

// Utilisation des routes pour la création des produits
app.use('/api', productRoutes);

// Configuration de cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

// Définition du port de demarrage du serveur
const PORT = process.env.PORT || 5200;

// Fonction pour demarrer le serveur
const start = async () => {
	try {
		// Connexion a la base de données
		await connectDB();
		// Demarrage du serveur sur le port specifié
		app.listen(PORT, () => console.log(`Le serveur à démarrer sur le port ${PORT}`));
	} catch (error) {
		console.log(error);
	}
};
// Appel de la fonction pour demarrer le serveur
start();
