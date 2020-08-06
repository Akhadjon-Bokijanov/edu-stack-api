const express = require('express');
const router = express.Router();

const auth = require('../helpers/auth');
const User = require('../models/Users');
const Blog = require('../models/Blogs');
const { admin, collaborator, creator } = require('../helpers/admin');
const { clearCache } = require('../helpers/customFuncs');


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
	next();
});


router.get('/', async (req, res) => {
	try {
		const blogs = await Blog.find().sort({ like: 1 })
			.limit(50).lean().cache('blog');
		res.status(200).json(blogs);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:id', async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id)
			.lean().cache(`blog_${req.params.id}`);
		res.status(200).json(blog);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/category/:category', async (req, res) => {
	try {
		const blogs = await Blog.find({categories: { $elemMatch: {$eq: req.params.category} }})
			.sort({ like: 1 }).lean().cache(`blog_${req.params.category}`);
		res.status(200).json(blogs);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/', auth, async (req, res) => {
	try {
		const blog = new Blog({
			title: req.body.title,
			description: req.body.description,
			categories: req.body.categories,
			creator: {
				_id: req.user._id,
				fullName: `${req.user.firstName} ${req.user.lastName}`,
				avatar: req.user.avatar
			},
			content: req.body.content
		});
		await blog.save();
		res.status(200).json({ success: true });
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	const clear = req.body.categories;
	clear.push('blog');
	clearCache(clear);
});

router.patch('/:id', [auth, creator], async (req, res) => {
	try {
		await Blog.findByIdAndUpdate(req.params.id, {
			$set: {
				title: req.body.title,
				description: req.body.description,
				content: req.body.content,
				categories: req.body.categories
			}
		});
		res.status(200).json({ success: true });
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	const clear = req.body.categories;
	clear.push('blog');
	clearCache(clear);
});

router.delete('/:id', [auth, creator], async (req, res) => {
	try {
		await Blog.findByIdAndDelete(req.params.id);
		res.status(200).json({ success: true });	
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache(['blog', `blog_${req.params.id}`]);
});

router.post('/like/:id', auth, async (req, res) => {
	try {
		const liked = await Blog.findById(req.params.id).select("creator +likedUsers").lean();
		if(liked.likedUsers.includes(req.user._id)) {
			return req.status(400).json({ message: 'You have already liked this Blog.' });
		}
		if(liked.creator._id !== req.body.creator._id) {
			return req.status(403).json({ message: "Don't try to cheat!" });
		}

		Promise.all([
			Blog.findByIdAndUpdate(req.params.id, {
				$push: {
					likedUsers: req.user._id
				},
				$inc: {
					like: 1
				}
			}),
			User.findByIdAndUpdate(req.body.creator._id, {
				$inc: {
					reputation: 1
				}
			})
		]);
		res.status(200).json({ success: true });	
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache(['blog', `blog_${req.params.id}`]);
});

router.get('/search/:text', async (req, res) => {
	try {
		const search = await Blog.find(
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