const productModel = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

// Fonction pour créer un produit (accessible seulement par l'administrateur)
module.exports.createProduct = async (req, res) => {
	try {
		// Verifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut créer un produit' });
		}
		// Récuperation des données du formulaire
		const { title, description, price } = req.body;

		// Verification si une image est télechargée
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}

		// Declaration de variable pour recuperer l'id de l'utilisateur qui va poster un produit
		const userId = req.user._id;

		// Utilisation de l'url de cloudinary et du public_id provenant du middleware
		const imageUrl = req.cloudinaryUrl;
		const imagePublicId = req.file.public_id;

		// Création d'un produit
		const newProduct = await productModel.create({
			title,
			description,
			price,
			imageUrl,
			imagePublicId,
			createdBy: userId,
		});

		res.status(200).json({ message: 'Produit ajouté avec succès', product: newProduct });
	} catch (error) {
		console.error('Erreur lors de la création du produit :', error.message);
		res.status(500).json({ message: 'Erreur lors de la création du produit' });
	}
};

// Fonction pour récuperer tous les produits
module.exports.getAllProducts = async (req, res) => {
	try {
		// Recupération de tous les produits
		const products = await productModel.find();
		// Réponse de succès
		res.status(200).json({ message: 'Liste des produits', products });
	} catch (error) {
		console.error('Erreur lors de la récupération des produits : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
	}
};

// Fonction qui va permettre de récuperer un seul produit avec son id
module.exports.getProductById = async (req, res) => {
	try {
		// Déclaration de la variable qui va rechercher l'id du produit
		const productId = req.params.id;

		// Récupération du produit par son id
		const product = await productModel.findById(productId);

		// Condition si le produit est introuvable
		if (!product) {
			return res.status(404).json({ message: 'Produit non trouvé' });
		}
		res.status(200).json({ message: 'Produit récuperé avec succès', product });
	} catch (error) {
		console.error('Erreur lors de la récupération du produit : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération du produit' });
	}
};

// Fonction pour modifier un produit avec son id (accessible seulement par l'administrateur)
module.exports.updateProduct = async (req, res) => {
	try {
		// Verifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut créer un produit' });
		}
		// Definition de la variable pour recupérer l'id du produit en paramètre d'url
		const productId = req.params.id;

		// Déclaration de variable pour vérifier si le produit existe en base de données
		const existingProduct = await productModel.findById(productId);

		// Condition si le produit n'existe pas
		if (!existingProduct) {
			return res.status(404).json({ message: 'Produit non trouvé' });
		}
		// Mettre à jour les propriétés du produit avec les données du corps de la requête
		existingProduct.title = req.body.title || existingProduct.title;
		existingProduct.description = req.body.description || existingProduct.description;
		existingProduct.price = req.body.price || existingProduct.price;

		// Vérifier si une nouvelle image est téléchargée, mettre à jour le chemin de l'image
		if (req.file) {
			// Supprimer l'ancienne image si il y a une
			if (existingProduct.imagePublicId) {
				await cloudinary.uploader.destroy(existingProduct.imagePublicId);
			}
			// Redonne une nouvelle url et un nouvel id a l'image
			existingProduct.imageUrl = req.cloudinaryUrl;
			existingProduct.imagePublicId = req.file.public_id;
		}
		// Enregistrer les modification dans la BDD
		const updateProduct = await existingProduct.save();

		// Réponse de succès
		res.status(200).json({
			message: 'Produit modifié avec succès',
			product: updateProduct,
		});
	} catch (error) {
		console.error('Erreur lors de la modification du produit : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la modification du produit' });
	}
};
// Fonction pour suppimer un produit avec son id (accessible seulement par l'administrateur)
module.exports.deleteProduct = async (req, res) => {
	try {
		// Verifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// Retour d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut supprimer un produit' });
		}
		// Récuperation de l'id du produit pour le mettre en paramètre d'url
		const productId = req.params.id;

		// Récupération de l'id du produit par rapport au model
		const product = await productModel.findById(productId);

		// Verifier si le produit existe
		if (!product) {
			return res.status(404).json({ message: 'Produit non trouvé' });
		}
		// Rechercher l'id de l'image sur cloudinary
		const imagePublicId = product.imagePublicId;

		// Suppression du produit
		const deletedProduct = await productModel.findByIdAndDelete(productId);

		// Condition si le produit est introuvable
		if (!deletedProduct) {
			return res.status(404).json({ message: 'Produit non trouvé' });
		}
		console.log('Image Public ID:', imagePublicId);
		console.log('Produit supprimé avec succès');

		// Suppression de l'image dans cloudinary
		if (imagePublicId) {
			await cloudinary.uploader.destroy(imagePublicId);
			console.log('Image supprimé de cloudinary avec succès');
		}

		res.status(200).json({ message: 'Produit supprimé avec succès' });
	} catch (error) {
		console.error('Erreur lors de la suppression du produit : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
	}
};
