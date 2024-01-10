const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
