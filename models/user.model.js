const userSchema = new mongoose.Schema({
	lastname: {
		type: String,
		required: [true, 'Veuillez renseigner votre nom'],
	},
	firstname: {
		type: String,
		required: [true, 'Veuillez renseigner votre prénom'],
	},
	birthday: {
		type: Date,
		required: [true, 'Veuillez renseigner votre date de naissance'],
	},
	address: {
		type: String,
		required: [true, 'Veuillez renseigner votre adresse'],
	},
	zipcode: {
		type: Number,
		required: [true, 'Veuillez renseigner votre code postal'],
	},
	city: {
		type: String,
		required: [true, 'Veuillez renseigner votre ville'],
	},
	phone: {
		type: Number,
		required: [true, 'Veuillez renseigner votre numéro de téléphone'],
	},
	avatarUrl: {
		type: String,
	},
	avatarPublicId: {
		type: String,
		default: null,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

// Export du modèle, du schema et mis dans la variable User
const User = mongoose.model('User', userSchema);
