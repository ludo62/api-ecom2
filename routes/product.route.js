const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// Admin
// Route pour créer un produit
router.post(
	'/create-product',
	authMiddleware.authenticate,
	upload.single('image'),
	productController.createProduct
);
// Admin
// Route pour récupérer tous les produits
router.get('/all-products', authMiddleware.authenticate, productController.getAllProducts);

// Admin
// Route pour récupérer un produit par son ID
router.get('/product/:id', authMiddleware.authenticate, productController.getProductById);
module.exports = router;
