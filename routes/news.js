const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const News = require('../models/News');
const User = require('../models/Users');
const auth = require('../helpers/auth');
const { admin, collaborator, newsCreator } = require('../helpers/admin');
const { newsStorage, fileFilter } = require('../helpers/multerVars');
const { clearCache } = require('../helpers/customFuncs');

const upload = multer({ 
	storage: newsStorage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
});


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://www.edustack.uz"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
	next();
});

router.get('/pending', [auth, admin], async (req, res) => {
	try {
		const pendingNews = await News.find({ status: false })
			.sort({ date: -1 }).lean().cache('news_pending');
		res.status(200).json(pendingNews); 
	}
	catch (err) {
		console.log(err);
		res.status(400).json({ message: err.message });
	}
});

router.get('/', async (req, res) => {
	try {
		const d = new Date();
		const news = await News.find({ date: { $gte: d.setDate(d.getDate()-30) }, status: true })
			.sort({date: -1}).lean().cache('news');
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

router.get('/org/:org', async (req, res) => {
	try {
		const news = await News.find({ organization: req.params.org, status: true })
			.cache(`news_org_${req.params.org}`);
		res.status(200).json(news);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:newsID', async (req, res) => {
	try {
		const news = await News.findById(req.params.newsID)
			.lean().cache(`news_${req.params.newsID}`);
		if(!news) {
			return res.status(404).json({ message: 'News not found.' });
		}
		res.status(200).json(news);
	}
	catch(err) {
		res.status(400).json({ message : err });
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
	clearCache(['news_pending', `news_org_${req.body.organization}`]);
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
	clearCache([`news_${req.params.newsID}`]);
});

router.patch('/:newsID', [auth, newsCreator], async (req, res) => {
	try {
		const update = await News.findByIdAndUpdate(
			req.params.newsID,
			{
				$set: {
					title: req.body.title,
					description: req.body.description,
					organization: req.body.organization,
					isImportant: req.body.isImportant,
					detail: req.body.detail,
					status: false
				} 
			},
			{ new: true }
		);
		res.status(200).json(update);
	}
	catch(err) {
		res.status(400).json({ message: err });
	}
	clearCache(['news', 'news_pending', `news_${req.params.newsID}`, `news_org_${req.body.organization}`]);
});

router.patch('/approve/:newsID', [auth, admin], async (req, res) => {
	try {
		const news = await News.findByIdAndUpdate(
			req.params.newsID,
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
	clearCache(['news', 'news_pending']);
});

router.get('/category/:category', async (req, res) => {
	try {
		const news = await News.find({ category: req.params.category })
			.sort({ date: -1 }).lean().cache(`news_${req.params.category}`);
		res.status(200).json(news);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/search/:text', async (req, res) => {
	try {
		const search = await News.find(
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