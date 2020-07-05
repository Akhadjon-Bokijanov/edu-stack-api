const express = require('express');
const router = express.Router();
const News = require('../models/News');
const auth = require('../helpers/auth');
const { admin, collaborator } = require('../helpers/admin');

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	next();
  });

router.get('/', async (req, res) => {
	try {
		const news = await News.find();
		res.json(news);
	}
	catch(err) {
		res.json({ message : err });
	}
});

router.get('/:newsID', async (req, res) => {
	try {
		const news = await News.findById(req.params.newsID);
		res.json(news);
	}
	catch(err) {
		res.json({ message : err });
	}
});

router.post('/', [auth, collaborator], async (req, res) => {
	const news = new News({
		title: req.body.title,
		description: req.body.description,
		organization: req.body.organization,
		category: req.body.category,
		imageUrl: req.body.imageUrl,
		isImportant: req.body.isImportant,
		detail: req.body.detail
	});

	try {
		const savedNews = await news.save();
		res.json(savedNews);
	}
	catch(err) {
		res.json({ message : err });
	}
});

router.delete('/:newsID', [auth, admin], async (req, res) => {
	try {
		const removed = await News.remove({ _id: req.params.newsID});
		res.json(removed);
	}
	catch(err) {
		res.json({ message : err });
	}
});

router.patch('/:newsID', [auth, admin], async (req, res) => {
	try {
		const update = await News.updateOne(
			{ _id: req.params.newsID},
			{
				$set: {
					title: req.body.title,
					description: req.body.description,
					organization: req.body.organization,
					category: req.body.category,
					imageUrl: req.body.imageUrl,
					isImportant: req.body.isImportant,
					detail: req.body.detail
				} 
			}
		);
		res.json(update);
	}
	catch(err) {
		res.json({ message: err });
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