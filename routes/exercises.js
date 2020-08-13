const express = require('express');
const router = express.Router();

const auth = require('../helpers/auth');
const { admin, collaborator, creator } = require('../helpers/admin');
const { clearCache } = require('../helpers/customFuncs');

const User = require('../models/Users');
const Exercise = require('../models/Exercises');


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://www.edustack.uz"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
	next();
});


router.get('/free', auth, async (req, res) => {
	try {
		const tests = await Exercise.find({ cost: 0 })
			.select('-inputFields').sort({ date: -1 }).lean().cache('exercise_free');
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/', auth, async (req, res) => {
	try {
		const tests = await Exercise.find().sort({ date: -1 }).select('-inputFields').lean().cache('exercise');
		res.status(200).json(tests);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:id', auth, async (req, res) => {
	try {
		const test = await Exercise.findById(req.params.id).lean().cache(`exercise_${req.params.id}`);
		res.status(200).json(test);
	}	
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/category/:category', async (req, res) => {
	try {
		const tests = await Exercise.find({ category: req.params.category })
			.select('-inputFields').lean().cache(`exercise_${req.params.category}`);

		res.status(200).json(tests);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/', [auth, collaborator], async (req, res) => {
	try {
		const test = new Exercise({
			title: req.body.title,
			description: req.body.description,
			cost: req.body.cost,
			time: req.body.time,
			inputFields: req.body.inputFields,
			isPrivate: req.body.isPrivate,
			type: req.body.type,
			category: req.body.category,
			creator: {
				_id: req.user._id,
				fullName: `${req.user.firstName} ${req.user.lastName}`,
				avatar: req.user.avatar
			}
		});
		await test.save();
		res.status(200).json({ success: true });
	}
	catch (err) {
		return res.status(400).json({ message: err.message });
	}
	const clear = ['exercise', `exercise_${req.body.category}`];
	if(req.body.cost !== 0) {
		clear.push('exercise_free');
	}
	clearCache(clear);
});

router.patch('/:id', [auth, creator], async (req, res) => {
	try {
		await Exercise.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					title: req.body.title,
					description: req.body.description,
					cost: req.body.cost,
					time: req.body.time,
					inputFields: req.body.inputFields,
					isPrivate: req.body.isPrivate,
					type: req.body.type,
					category: req.body.category		
				}
			}
		);
		res.status(200).json({ success: true });
	}
	catch (err) {
		return res.status(400).json({ message: err.message });
	}
	clearCache(['exercise', `exercise_${req.body.category}`, `exercise_${req.params.id}`, 'exercise_free']);
});

router.delete('/:id', [auth, creator], async (req, res) => {
	try {
		await Exercise.findByIdAndDelete(req.params.id);
		res.status(200).json({ success: true });
	}
	catch (err) {
		return res.status(400).json({ message: err.message });
	}
	clearCache(['exercise', `exercise_${req.params.id}`, 'exercise_free']);
});

router.post('/answer/:id', auth, async (req, res) => {
	try {
		if(req.params.id !== req.user._id) {
			return res.status(403).json({ message: 'You can\'n solve for others!' });
		}
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{
				$push: {
					testScores: {
						_id: req.body._id,
						score: req.body.score,
						title: req.body.title,
						date: new Date()
					}
				}
			},
			{ new: true }
		);
		res.status(200).json(user);
	}
	catch (err) {
		return res.status(400).json({ message: err.message });
	}
	clearCache(['user', `user_${req.params.id}`]);
});


module.exports = router;