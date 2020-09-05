const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

const Course = require('../models/Courses');
const auth = require('../helpers/auth');
const { admin, creator } = require('../helpers/admin');
const { clearCache } = require('../helpers/customFuncs');
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


router.get('/free', async (req, res) => {
	try {
		const free = await Course.find({ cost: 0 }).sort({ rating: 1 }).lean().cache('course_free');
		res.status(200).json(free);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/', async (req, res) => {
	try {
		const courses = await Course.find().sort({ rating: 1 }).lean().cache('course');
		res.status(200).json(courses);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/category/:category', async (req, res) => {
	try {
		const courses = await Course.find({categories: { $elemMatch: {$eq: req.params.category} }})
			.lean().sort({ rating: 1 }).cache(`course_${req.params.category}`);
		res.status(200).json(courses);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:id', auth, async (req, res) => {
	try {	
		const course = await Course.findById(req.params.id).select('+lessons +paidUsers').lean();
		if(course.cost != 0) {
			if(course.paidUsers && course.paidUsers.includes(req.user._id)) {
				return res.status(200).json(course);
			}
			return res.status(403).json({ message: 'You have not paid for this course!' });
		}
		res.status(200).json(course);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/', auth, async (req, res) => {
	try {
		const course = new Course({
			title: req.body.title,
			detail: req.body.detail,
			lessons: [],
			cost: req.body.cost,
			previewImage: req.body.previewImage,
			categories: req.body.categories,
			creator: {
				_id: req.user._id,
				fullName: `${req.user.firstName} ${req.user.lastName}`,
				avatar: req.user.avatar
			} 
		});
		const saved = await course.save();
		res.status(200).json(saved);
	}
	catch (err) {
		return res.status(400).json({ message: err.message });
	}
	clearCache(['course', 'course_free']);
});

router.patch('/:id', [auth, creator], async (req, res) => {
	try {
		const update = await Course.findByIdAndUpdate(req.params.id, {
			$set: {
				title: req.body.title,
				detail: req.body.detail,
				cost: req.body.cost,
				previewImage: req.body.previewImage,
				categories: req.body.categories,
			}
		}, { new: true });
		res.status(200).json(update);
	}
	catch (err) {
		return res.status(400).json({ message: err.message });
	}
	clearCache(['course', 'course_free']);
});

router.post('/pushlesson/:id', [auth, creator], async (req, res) => {
	try {
		const course = await Course.findById(req.params.id).select('+lessons');
		if(!course) {
			return res.status(404).json({ message: 'Course not found!' });
		}

		course.lessons.splice(req.body.index, 0, req.body.lesson);

		const saved = await course.save();
		res.status(200).json(saved);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/deletelesson/:id', [auth, creator], async (req, res) => {
	try {
		const course = await Course.findById(req.params.id).select('+lessons');
		if(!course) {
			return res.status(404).json({ message: 'Course not found!' });
		}

		course.lessons.splice(req.body.index, 1);

		const saved = await course.save();
		res.status(200).json(saved);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.patch('/updatelesson/:id', [auth, creator], async (req, res) => {
	try {
		const course = await Course.findById(req.params.id).select('+lessons');
		if(!course) {
			return res.status(404).json({ message: 'Course not found!' });
		}

		course.lessons[req.body.index] = req.body.lesson;

		const saved = await course.save();
		res.status(200).json(saved);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.delete('/:id', [auth, creator], async (req, res) => {
	try {
		await Course.findByIdAndDelete(req.params.id);
		res.status(200).json({ success: true });
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache(['course', 'course_free']);
});

router.patch('/rate/:id', auth, async (req, res) => {
	try {
		const course = await Course.findById(req.params.id).select('+ratedUsers');
		if(course.ratedUsers && course.ratedUsers.includes(req.user._id)) {
			return res.status(400).json({ message: "You have already rated this course!" });
		}

		const {average, voters} = course.rating;
		course.rating.average = (average * voters + req.body.rating) / (voters + 1);
		course.rating.voters += 1;
		course.ratedUsers.push(req.user._id);

		const rated = await course.save();
		res.status(200).json(rated);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/search/:text', async (req, res) => {
	try {
		const search = await Course.find(
			{ 
				$text: { 
					$search: req.params.text 
				}, 
			},
			{
				score: {
					$meta: "textScore"
				}
			}).sort({ score : { $meta : 'textScore' } }).lean(); 
		res.status(200).json(search);	
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});


module.exports = router;