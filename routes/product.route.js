const router = require('express').Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour créer un produit (accessible uniquement par l'administrateur)
router.post(
	'/api/create-product',
	authMiddleware.authenticate,
	cloudinaryUpload,
	productController.createProduct,
);

// Route pour recupérer tous les produits
router.get('/api/all-products', productController.getAllProducts);

// Route pour récuperer un seul produit avec son id
router.get('/api/product/:id', productController.getProductById);

// Route pour modifier un produit (accessible uniquement par l'administrateur)
router.put(
	'/api/update-product/:id',
	authMiddleware.authenticate,
	cloudinaryUpload,
	productController.updateProduct,
);
// Route pour Supprimer un produit (accessible uniquement par l'administrateur)
router.delete(
	'/api/delete-product/:id',
	authMiddleware.authenticate,
	productController.deleteProduct,
);

module.exports = router;
