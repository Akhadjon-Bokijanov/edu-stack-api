const express = require('express');
const router = express.Router();
const multer = require('multer');
const _ = require('lodash');
const fs = require('fs');
const bcrypt = require('bcrypt');
const User = require('../models/Users');
const auth = require('../helpers/auth');
const { userStorage, fileFilter } = require('../helpers/multerVars');


const upload = multer({
	storage: userStorage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Expose-Headers", "x-token" )
	res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE')
	next();
  });


router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');
		res.status(200).json(user);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});


router.patch('/changePhoto', [auth, upload.any()], async (req, res) => {
	try {
		if(req.files.length > 0) {
			if(req.user.avatar !== 'uploads/avatars/default.png') {
				fs.unlink(req.user.avatar, (err) => {
					if(err) {
						throw err;
					}
				});
			}
			const user = await User.updateOne(
				{ _id: req.user._id},
				{
					$set: {
						avatar: req.files[0].path
					} 
				},
				{ new: true }
			);
			res.status(200).header('x-token', user.genToken()).json(_.omit(user.toObject(), ['password']));
		}
		else {
			res.status(400).json({ message: 'No proper image uploaded(allowed image types are: .png, .jpeg, .jpg).' });
		}
	}
	catch (err) {
		console.log(err);
		res.status(400).json({ message: err.message });
	}
});


router.patch('/changePassword', auth, async (req, res) => {
	try {	
		const user = await User.findById(req.user._id);

		const match = await bcrypt.compare(req.body.oldPassword, user.password);
		if(match) {
			const salt = await bcrypt.genSalt(10);
			const newPassword = await bcrypt.hash(req.body.newPassword, salt);
			const changed = await User.findOneAndUpdate(
				{ _id: req.user._id},
				{
					$set: {
						password: newPassword
					} 
				},
				{ returnOriginal: false }
			);
			res.status(200).json(_.omit(changed.toObject(), ['password']));
		}
		else {
			res.status(400).json({ message: 'Invalid password.' });
		}
	} 
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});


router.patch('/changeInfo', auth, async (req, res) => {
	try {
		const user = await User.findOneAndUpdate(
			{ _id: req.user._id },
			{
				$set: {
					firstname: req.body.firstname,
					lastName: req.body.lastName,
					address: req.body.address,
					occupation: req.body.occupation,
					organisation: req.body.organisation
				}
			},
			{ new: true }
		);
		res.status(200).header('x-token', user.genToken()).json(_.omit(user.toObject(), ['password']));
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

module.exports = router;