const Product = require('../models/product.model');

// Fonction pour créer un produit (accessible seulement par l'administrateur)
module.exports.createProduct = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est un administrateur
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message: 'Action non autorisée. Seul un administrateur peut créer un produit.',
			});
		}

		// Récupérer les données du formulaire pour créer un produit
		const { title, description, price } = req.body;

		// Créer le produit
		const newProduct = await Product.create({ title, description, price });

		res.status(201).json({ message: 'Produit créé avec succès', product: newProduct });
	} catch (error) {
		console.error('Erreur lors de la création du produit :', error.message);
		res.status(500).json({ message: 'Erreur lors de la création du produit', error });
	}
};
