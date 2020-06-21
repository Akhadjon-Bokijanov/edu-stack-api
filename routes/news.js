const express = require('express');
const router = express.Router();
const News = require('../models/News');


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

router.post('/', async (req, res) => {
	const news = new News({
		title: req.body.title,
		description: req.body.description,
		organization: req.body.organization,
		category: req.body.category,
		image_url: req.body.image_url,
		importance: req.body.importance
	});

	try {
		const savedNews = await news.save();
		res.json(savedNews);
	}
	catch(err) {
		res.json({ message : err });
	}
});

router.delete('/:newsID', async (req, res) => {
	try {
		const removed = await News.remove({ _id: req.params.newsID});
		res.json(removed);
	}
	catch(err) {
		res.json({ message : err });
	}
});

router.patch('/:newsID', async (req, res) => {
	try {
		const update = await News.updateOne(
			{ _id: req.params.newsID},
			{
				$set: {
					title: req.body.title,
					description: req.body.description,
					organization: req.body.organization,
					category: req.body.category,
					image_url: req.body.image_url,
					importance: req.body.importance
				} 
			}
		);
		res.json(update);
	}
	catch(err) {
		res.json({ message: err });
	}
});

module.exports = router;