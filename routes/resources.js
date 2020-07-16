const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');

const auth = require('../helpers/auth');
const { admin, collaborator, creator } = require('../helpers/admin');
const User = require('../models/Users');
const Resource = require('../models/Resources');
const { resourceFilter, resourceStorage } = require('../helpers/multerVars');

const upload = multer({
	storage: resourceStorage,
	limits: {
		fileSize: 1024 * 1024 * 256
	},
	fileFilter: resourceFilter
});


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
	next();
});


router.get('/', auth, async (req, res) => {
	try {
		const resourses = await Resource.find().lean();
		res.status(200).json(resourses);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:id', auth, async (req, res) => {
	try {
		const resourse = await Resource.findById(req.params.id).lean();
		if(!resourse) {
			return res.status(404).json({ message: "Resource not found." });
		}
		res.status(200).json(resourse);
	} 
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/', [auth, collaborator, upload.any()], async (req, res) => {
	try {
		let resourse = new Resource({
			title: req.body.title,
			description: req.body.description,
			resourceType: req.body.resourceType,
			category: req.body.category,
			costType: req.body.costType,
			cost: req.body.cost,
			creatorId: req.user._id
		});
		if(req.files.length === 1) {
			resourse.file = req.files[0].path.replace("\\", "/").replace("\\", "/");
			const saved = await resourse.save();
			res.status(200).json(saved);
		}
		else {
			return res.status(400).json({ message: "Only one file required." });
		}
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.patch('/:id', [auth, creator], async (req, res) => {
	try {
		const update = await Resource.findOneAndUpdate(
			{ _id: req.params.id },
			{
				$set: {
					title: req.body.title,
					description: req.body.description,
					resourceType: req.body.resourceType,
					costType: req.body.costType,
					category: req.body.category,
					cost: req.body.cost
				}
			},
			{ new: true }
		);
		res.status(200).json(update);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.patch('/file/:id', [auth, creator], async (req, res) => {
	try {
		if(req.files.length === 1) {
			fs.exists(req.body.file, (exists) => {
				if(exists) {
					fs.unlink(req.body.file, (err) => {
						if(err) {
							console.log(err);
						}
					});
				}
			});

			const update = await Resource.findOneAndUpdate(
				{ _id: req.params.id },
				{
					$set: {
						file: req.files[0].path.replace('\\', '/').replace('\\', '/')
					}
				},
				{ new: true }
			);
			res.status(200).json(update);
		}
		else {
			res.status(400).json({ message: "Only one file required." });
		}
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.delete('/:id', [auth, creator], async (req, res) => {
	try {
		fs.exists(req.body.file, (exists) => {
			if(exists) {
				fs.unlink(req.body.file, (err) => {
					if(err) {
						console.log(err);
					}
				});
			}
		});
		const removed = await Resource.remove({ _id: req.params.id });
		res.status(200).json(removed);	
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});


module.exports = router;