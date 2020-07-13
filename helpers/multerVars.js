const multer = require('multer');

const newsStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/newsImages');
	},
	filename: function(req, file, cb) {
		const date = new Date;
		cb(null, `${ req.user._id }_${ date.getTime()}.${ file.mimetype.split('/')[1] }`);
	}
});

const userStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/avatars');
	},
	filename: function(req, file, cb) {
		const date = new Date;
		cb(null, `${ req.user._id }_${ date.getTime()}.${ file.mimetype.split('/')[1] }`);
	}
});

const resourceStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/resources');
	},
	filename: function(req, file, cb) {
		const date = new Date;
		cb(null, `${ req.user._id }_${ date.getTime()}.${ file.mimetype.split('/')[1] }`);
	}
});

const fileFilter = (req, file, cb) => {
	if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

const resourceFilter = (req, file, cb) => {
	if(file.mimetype === 'application/pdf') {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

module.exports = {
	newsStorage: newsStorage,
	userStorage: userStorage,
	fileFilter: fileFilter,
	resourceStorage: resourceStorage,
	resourceFilter: resourceFilter
};