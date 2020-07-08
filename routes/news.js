const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const News = require('../models/News');
const User = require('../models/Users');
const auth = require('../helpers/auth');
const { admin, collaborator, newsCreator } = require('../helpers/admin');
const { storage, fileFilter } = require('../helpers/multerVars');


const upload = multer({ 
	storage: storage,
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
		const news = await News.find().sort({date: -1});
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

router.get('/:newsID', async (req, res) => {
	try {
		const news = await News.findById(req.params.newsID);
		if(!news) {
			return res.status(404).send('News not found.');
		}
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

router.post('/', [auth, upload.any(), collaborator], async (req, res) => {
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
			news.imageUrl = req.files[0].path;
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
				if(err) throw err;
			});
		}	
		const removed = await News.remove({ _id: req.params.newsID});
		res.status(200).json(removed);
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

router.patch('/:newsID', [auth, newsCreator], async (req, res) => {
	try {
		const update = await News.updateOne(
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
			}
		);
		res.status(200).json(update);
	}
	catch(err) {
		res.status(400).json({ message: err });
	}
});

router.post('/approve/:newsID', [auth, admin], async (req, res) => {
	try {
		const news = await News.updateOne(
			{ _id: req.params.newsID},
			{
				$set: {
					status: true
				} 
			}
		);
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json( { message : err.message});
	}
});

module.exports = router;