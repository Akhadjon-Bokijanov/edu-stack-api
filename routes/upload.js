const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();	

require('dotenv/config');
const auth = require('../helpers/auth');

const s3 = new AWS.S3({
	accessKeyId: process.env.accessKeyId,
	secretAccessKey: process.env.secretAccessKey
});


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://www.edustack.uz"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
	next();
});

// Handle uploading stuff
router.post('/', auth, async (req, res) => {
	try {
		const currentDate = new Date();
		const key = `${req.body.route}/${req.user._id}_${currentDate.getTime()}.${req.body.type}`;
		s3.getSignedUrl('putObject', {
			Bucket: 'edustack.uz',
			ContentType: `${req.body.contentType}`,
			Key: key
		}, (err, url) => {
			if(err) {
				return res.status(400).json({ message: err });
			}
			res.status(200).json({ url: url, key: key });
		});
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// import
module.exports = router;