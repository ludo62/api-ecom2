const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	imageUrl: {
		type: String,
	},
	imagePublicId: {
		type: String,
		default: null,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
