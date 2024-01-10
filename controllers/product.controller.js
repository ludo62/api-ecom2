const productModel = require('../models/product.model');

// Fonction pour créer un produit (accessible seulement par l'administrateur)
module.exports.createProduct = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut créer un produit' });
		}

		const { title, description, price } = req.body;

		// Vérifier si une image est téléchargée
		if (!req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}

		const imageUrl = req.file.path; // Récupérer l'URL de l'image après téléchargement

		const userId = req.user._id;

		const newProduct = await productModel.create({
			title,
			description,
			price,
			imageUrl, // Enregistrer l'URL de l'image dans la base de données
			createdBy: userId,
		});

		res.status(200).json({ message: 'Produit ajouté avec succès', product: newProduct });
	} catch (error) {
		console.error('Erreur lors de la création du produit :', error.message);
		res.status(500).json({ message: 'Erreur lors de la création du produit' });
	}
};

// Fonction pour récupérer tous les produits (accessible seulement par l'administrateur)
module.exports.getAllProducts = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est un administrateur
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message:
					'Action non autorisée. Seul un administrateur peut récupérer tous les produits.',
			});
		}

		// Récupérer tous les produits
		const products = await productModel.find();

		res.status(200).json({ message: 'Liste de produits récupérée avec succès', products });
	} catch (error) {
		console.error('Erreur lors de la récupération des produits :', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
	}
};

// Fonction pour récupérer un produit par son ID (accessible seulement par l'administrateur)
module.exports.getProductById = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est un administrateur
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message:
					'Action non autorisée. Seul un administrateur peut récupérer un produit par son ID.',
			});
		}

		const productId = req.params.id;

		// Récupérer le produit par son ID
		const product = await productModel.findById(productId);

		if (!product) {
			return res.status(404).json({ message: 'Produit non trouvé' });
		}

		res.status(200).json({ message: 'Produit récupéré avec succès', product });
	} catch (error) {
		console.error('Erreur lors de la récupération du produit par ID :', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération du produit par ID' });
	}
};
