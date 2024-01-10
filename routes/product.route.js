const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/authenticate');

// Route pour créer un produit (accessible uniquement par l'administrateur)
router.post('/create-product', authMiddleware.authenticate, productController.createProduct);

module.exports = router;
