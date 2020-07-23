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
		const resources = await Resource.find({ resourceType: 'public' })
			.limit(50).sort({ date: -1 }).lean();
		res.status(200).json(resources);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:category', auth, async (req, res) => {
	try {
		const resources = await Resource.find({ resourceType: 'public', category: req.params.category })
			.sort({ date: -1 }).lean();
		res.status(200).json(resources);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/all', [auth, admin], async (req, res) => {
	try {
		const resources = await Resource.find().sort({ date: -1 }).lean();
		res.status(200).json(resources);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:id', auth, async (req, res) => {
	try {
		const resource = await Resource.findById(req.params.id).lean();
		if(!resource) {
			return res.status(404).json({ message: "Resource not found." });
		}
		res.status(200).json(resource);
	} 
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/', [auth, collaborator, upload.any()], async (req, res) => {
	try {
		let resource = new Resource({
			title: req.body.title,
			description: req.body.description,
			resourceType: req.body.resourceType,
			category: req.body.category,
			costType: req.body.costType,
			cost: req.body.cost,
			creator: {
				_id: req.user._id,
				fullName: `${req.user.firstName} ${req.user.lastName}`,
				avatar: req.user.avatar
			}
		});
		if(req.files.length === 1) {
			resource.file.fileName = req.files[0].filename.split('.')[0];
			resource.file.fileType = req.files[0].originalname.split('.').slice(-1)[0];
			resource.file.fileSize = req.files[0].size;
			const saved = await resource.save();
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
			const path = `uploads/resources/${req.body.fileName}.${req.body.fileType}`.toString();
			fs.exists(path, (exists) => {
				if(exists) {
					fs.unlink(path, (err) => {
						if(err) {
							console.log(err);
						}
					});
				}
				else {
					return res.status(404).json({ message: "File is not found." });
				}
			});

			const update = await Resource.findOneAndUpdate(
				{ _id: req.params.id },
				{
					$set: {
						'file.filename': req.files[0].filename.split('.')[0],
						'file.fileType': req.files[0].originalname.split('.').slice(-1)[0],
						'file.fileSize': req.files[0].size
					}
				},
				{ new: true }
			);
			res.status(200).json({ success: true });
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
		const path = `uploads/resources/${req.body.fileName}.${req.body.fileType}`.toString();
		fs.exists(path, (exists) => {
			if(exists) {
				fs.unlink(path, (err) => {
					if(err) {
						console.log(err);
					}
				});
			}
			else {
				return res.status(404).json({ message: "File is not found." });
			}
		});
		const removed = await Resource.deleteOne({ _id: req.params.id });
		res.status(200).json(removed);	
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.patch('/rate/:id', auth, async (req, res) => {
	try {
		let resourse = await Resource.findOne({ _id: req.params.id })
			.select("rating +ratedUsers").lean();
		
		if(resourse.ratedUsers.some(r => r.user === req.user._id)) {
			return res.status(400).json({ message: "You have already rated this resourse." });
		}
		else {
			const average = resourse.rating.average;
			const users = resourse.rating.voters;
			const updated = await Resource.findOneAndUpdate(
				{ _id: req.params.id },
				{
					$set: {
						"rating.average": (average * users + req.body.rating) / (users + 1),
						"rating.voters": users + 1
					},
					$push: {
						ratedUsers: {
							user: req.user._id,
							rating: req.body.rating
						}
					}
				},
				{ new: true }
			);
			res.status(200).json(updated);
		}
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/rating/:userId/:resourceId', auth, async (req, res) => {
	try {
		const rating = await Resource.findOne({ _id: req.params.resourceId }, { ratedUsers: { $elemMatch: { user: req.params.userId } } })
			.select("_id +ratedUsers").lean();
		console.log(rating);
		if(!rating) {
			res.status(200).json({ rating: 0 });
		}
		else {
			res.status(200).json({ rating: rating.ratedUsers[0].rating });
		}
	}	
	catch(err) {
		res.status(400).json({ message: err.message });
	}
});


router.get('/download/:file/:mime/:title', async (req, res) => {
	try {
		const file = req.params.file;
		const title = req.params.title;
		const mime = req.params.mime;
		res.header({
			'Content-Disposition': "attachment;filename=EduStackuz2.pdf",
			'Content-Type': "application/pdf"
		})
			.download(`uploads/resources/${file}.${mime}`, `EduStackuz_${title}.${mime}`);
	}
	catch (err) {
		console.log(err.message)
		res.status(400).json({ message: err.message });
	}
});


module.exports = router;