const multer = require('multer');

// Configuration de Multer pour stocker les images dans un dossier spécifique
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // Le dossier où les images seront stockées
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname); // Nom du fichier pour éviter les doublons
	},
});

const upload = multer({ storage: storage });

module.exports = upload;
