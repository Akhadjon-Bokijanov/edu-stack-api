const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();	

require('dotenv/config');
const auth = require('../helpers/auth');

const s3 = new AWS.S3({
	accessKeyId: process.env.accessKeyId,
	secretAccessKey: process.env.secretAccessKey
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