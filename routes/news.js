const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const News = require('../models/News');
const User = require('../models/Users');
const auth = require('../helpers/auth');
const { admin, collaborator, newsCreator } = require('../helpers/admin');
const { newsStorage, fileFilter } = require('../helpers/multerVars');


const upload = multer({ 
	storage: newsStorage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
	next();
});

router.get('/', async (req, res) => {
	try {
		const d = new Date();
		const news = await News.find({ date: { $gte: d.setDate(d.getDate()-30) } }).sort({date: -1}).lean();
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

router.get('/:newsID', async (req, res) => {
	try {
		const news = await News.findById(req.params.newsID).lean();
		if(!news) {
			return res.status(404).json({ message: 'News not found.' });
		}
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

router.get('/test/:text', (req, res) => {
	try {
		console.log(req.params.text);
		res.send(req.params.text);
	}
	catch(err) {
		res.send(err.message);
	}
});

router.post('/', [auth, collaborator, upload.any()], async (req, res) => {
	try {	
		let news = new News({
			title: req.body.title,
			description: req.body.description,
			organization: req.body.organization,
			category: req.body.category,
			isImportant: req.body.isImportant,
			detail: req.body.detail
		});
		if(req.files.length > 0) {
			news.imageUrl = req.files[0].path.replace("\\", "/").replace("\\", "/");
		}
		news.creatorId = req.user._id;
		const savedNews = await news.save();
		
		res.status(200).json(savedNews);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.delete('/:newsID', [auth, newsCreator], async (req, res) => {
	try {
		const news = await News.findById(req.params.newsID);
		if(news.imageUrl !== 'uploads/newsImages/default.png') {
			fs.unlink(news.imageUrl, (err) => {
				if(err) {
					console.log(err);
				}
			});
		}	
		const removed = await News.deleteOne({ _id: req.params.newsID});
		res.status(200).json(removed);
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

router.patch('/:newsID', [auth, newsCreator], async (req, res) => {
	try {
		const update = await News.findOneAndUpdate(
			{ _id: req.params.newsID},
			{
				$set: {
					title: req.body.title,
					description: req.body.description,
					organization: req.body.organization,
					category: req.body.category,
					isImportant: req.body.isImportant,
					detail: req.body.detail
				} 
			},
			{ new: true }
		);
		res.status(200).json(update);
	}
	catch(err) {
		res.status(400).json({ message: err });
	}
});

router.patch('/approve/:newsID', [auth, admin], async (req, res) => {
	try {
		const news = await News.findOneAndUpdate(
			{ _id: req.params.newsID},
			{
				$set: {
					status: true
				} 
			},
			{ new: true }
		);
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json( { message : err.message});
	}
});

module.exports = router;