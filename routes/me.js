const express = require('express');
const router = express.Router();
const multer = require('multer');
const _ = require('lodash');
const fs = require('fs');
const bcrypt = require('bcrypt');

const User = require('../models/Users');
const News = require('../models/News');
const Resource = require('../models/Resources');
const Question = require('../models/Questions');
const Blog = require('../models/Blogs');
const Survey = require('../models/Surveys');
const auth = require('../helpers/auth');
const { userStorage, fileFilter } = require('../helpers/multerVars');
const { clearCache } = require('../helpers/customFuncs');


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
	res.header("Access-Control-Expose-Headers", "x-token" );
	res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
	next();
});


router.get('/', auth, async (req, res) => {
	try {
<<<<<<< HEAD
		const user = await User.findById(req.user._id).select('-password +notification +lastNotificationCount').lean();
=======
		const user = await User.findById(req.user._id).select('-password +notification');
>>>>>>> 754c6b8ce7f5634bf44e110ab61ccf14e01165b3
		res.status(200).header('x-token', user.genToken()).json(user);
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
						console.log(err);
					}
				});
			}
			const user = await User.findOneAndUpdate(
				{ _id: req.user._id},
				{
					$set: {
						avatar: req.files[0].path.replace("\\", "/").replace("\\", "/")
					} 
				},
				{ new: true }
			);
			res.status(200).header('x-token', user.genToken()).json(user.toJSON());
		}
		else {
			res.status(400).json({ message: 'No proper image uploaded(allowed image types are: .png, .jpeg, .jpg).' });
		}
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache([`user_${req.user._id}`]);
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
				{ new: true }
			);
			res.status(200).json(changed.toJSON());
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
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					address: req.body.address,
					occupation: req.body.occupation,
					organisation: req.body.organisation,
					contact: req.body.contact,
					description: req.body.description,
					dateOfBirth: req.body.dateOfBirth
				}
			},
			{ new: true }
		);
		res.status(200).header('x-token', user.genToken()).json(user.toJSON());
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache([`user_${req.user._id}`]);
});

router.patch('/changeBackground', auth, async (req, res) => {
	try {
		const update = await User.findOneAndUpdate(
			{ _id: req.user._id },
			{
				$set: {
					background: req.body.background
				}
			},
			{ new: true }
		);
		res.status(200).json(update);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache([`user_${req.user._id}`]);
});

router.patch('/changeSkills', auth, async (req, res) => {
	try {
		const user = await User.findOneAndUpdate(
			{ _id: req.user._id },
			{
				$set: {
					skills: req.body.skills
				}
			},
			{ new: true }
		);
		res.status(200).json(user.toJSON());
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache([`user_${req.user._id}`]);
});

router.get('/myresources', auth, async (req, res) => {
	try {
		const resources = await Resource.find({ 'creator._id': req.user._id }).sort({ date: -1 }).lean();
		res.status(200).json(resources);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/myquestions', auth, async (req, res) => {
	try {
		const questions = await Question.find({ 'creator._id': req.user._id }).sort({ date: -1 }).lean();
		res.status(200).json(questions);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/myblogs', auth, async (req, res) => {
	try {
		const questions = await Blog.find({ 'creator._id': req.user._id }).sort({ like: 1 }).lean();
		res.status(200).json(questions);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/mysurveys', auth, async (req, res) => {
	try {
		const questions = await Survey.find({ 'creator._id': req.user._id }).sort({ responceCount: 1 }).lean();
		res.status(200).json(questions);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/mynews', auth, async (req, res) => {
	try {
		const news = await News.find({ creatorId: req.user._id }).sort({ date: -1 }).lean();
		res.status(200).json(news);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/follow', auth, async (req, res) => {
	const { follower, following, action } = req.body;
	try {

		if(!(req.user._id === follower._id || req.user._id === following._id)) {
			return res.status(403).json({ message: 'You are not allowed.' });
		}
		if(action === 'follow' && req.user._id !== follower._id) {
			return res.status(403).json({ message: 'You are not allowed.' });
		}
		
		const userInfo = await User.findById(req.user._id).select('followers following').lean();
		if(action === 'follow' && userInfo.following.some(el => el._id === following._id)) {
			return res.status(400).json({ message: 'You are already following this user' });
		}
		if(following._id === follower._id) {
			return res.status(400).json({ message: 'You can\'t (un)follow yourself.' });
		}

		switch(action) {
			case 'follow':
				await Promise.all([
					User.findByIdAndUpdate(follower._id, {
						$push: {
							following: following
						}
					}),
					User.findByIdAndUpdate(following._id, {
						$push: {
							followers: follower
						}
					})
				]);
				break;

			case 'unfollow':
				await Promise.all([
					User.findByIdAndUpdate(follower._id, {
						$pull: {
							following: following
						}
					}),
					User.findByIdAndUpdate(following._id, {
						$pull: {
							followers: follower
						}
					})
				]);
				break;

			default: 
				break;
		}
		res.status(200).json({ success: true });
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache([`user_${follower._id}`, `user_${following._id}`]);
});

router.post('/wishlist', auth, async (req, res) => {
	try {
		const wish = await User.findByIdAndUpdate(
			req.user._id,
			{
				$push: {
					wishList: req.body
				}
			},
			{ new: true }
		);
		res.status(200).json(wish);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache([`user_${req.user._id}`]);
});

router.patch('/wishlist', auth, async (req, res) => {
	try {
		const wish = await User.findByIdAndUpdate(
			req.user._id,
			{
				$pull: {
					wishList: req.body
				}
			},
			{ new: true }
		);
		res.status(200).json(wish);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache([`user_${req.user._id}`]);
});

router.post('/cartlist', auth, async (req, res) => {
	try {
		const cart = await User.findByIdAndUpdate(
			req.user._id,
			{
				$push: {
					cartList: req.body
				}
			},
			{ new: true }
		);
		res.status(200).json(cart);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.patch('/cartlist', auth, async (req, res) => {
	try {
		const cart = await User.findByIdAndUpdate(
			req.user._id,
			{
				$pull: {
					cartList: req.body
				}
			},
			{ new: true }
		);
		res.status(200).json(cart);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});


module.exports = router; 