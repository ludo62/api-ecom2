const multer = require('multer');

// Configuration de multer pour stocker les fichiers dans un dossier local
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads'); // Spécifiez le dossier où les fichiers doivent être stockés
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname); // Utilisez le nom d'origine du fichier pour le stocker
	},
});

const upload = multer({ storage: storage });

module.exports = upload;
