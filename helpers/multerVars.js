const multer = require('multer');

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/newsImages');
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

module.exports = {
	storage: storage,
	fileFilter: fileFilter
}