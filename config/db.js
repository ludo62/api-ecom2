// On importe mongoose
const mongoose = require('mongoose');

// Definition de l'url de connexion a la base de données
const url = process.env.MONGO_URI;

const connectDB = () => {
	mongoose
		.connect(url)
		// Le .then() est une promesse qui permet de gerer la connexion a la base de données et le .catch() permet de gerer et capturer les erreurs
		.then(() => {
			console.log('Connexion à la base de données réussie');
		})
		.catch((err) => {
			console.error('Erreur de connexion avec la base de données', err.message);
		});
};

// Export de la fonction connectDB
module.exports = connectDB;
