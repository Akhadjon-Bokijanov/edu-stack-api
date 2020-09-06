const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
require('dotenv/config');

const auth = require('../helpers/auth');
const { admin, collaborator, creator } = require('../helpers/admin');
const User = require('../models/Users');
const Resource = require('../models/Resources');
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


router.get('/', auth, async (req, res) => {
	try {
		const resources = await Resource.find({ resourceType: 'public' })
			.limit(50).sort({ date: -1 }).lean().cache('resource');
		res.status(200).json(resources);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/category/:category', auth, async (req, res) => {
	try {
		const resources = await Resource.find({ resourceType: 'public', category: req.params.category })
			.sort({ date: -1 }).lean().cache(`resource_${req.params.category}`);
		res.status(200).json(resources);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/all', [auth, admin], async (req, res) => {
	try {
		const resources = await Resource.find().sort({ date: -1 })
			.lean().cache('resource_all');
		res.status(200).json(resources);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:id', auth, async (req, res) => {
	try {
		const resource = await Resource.findById(req.params.id)
			.lean().cache(`resource_${req.params.id}`);
		if(!resource) {
			return res.status(404).json({ message: "Resource not found." });
		}
		res.status(200).json(resource);
	} 
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.post('/', auth, async (req, res) => {
	try {
		const resource = new Resource({
			title: req.body.title,
			description: req.body.description,
			resourceType: req.body.resourceType,
			category: req.body.category,
			costType: req.body.costType,
			cost: req.body.cost,
			
			file: {
				fileName: req.body.file.fileName,
				fileType: req.body.file.fileType,
				fileSize: req.body.file.fileSize
			},
			creator: {
				_id: req.user._id,
				fullName: `${req.user.firstName} ${req.user.lastName}`,
				avatar: req.user.avatar
			}
		});
		const saved = await resource.save();
		res.status(200).json(saved);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache(['resource', `resource_${req.body.category}`, 'resource_all']);
});

router.patch('/:id', [auth, creator], async (req, res) => {
	try {
		const update = await Resource.findByIdAndUpdate(
			req.params.id,
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
	clearCache(['resource', 'resource_all', `resource_${req.params.id}`]);
});


// should be changed when AWS S3 used
router.patch('/file/:id', [auth, creator], async (req, res) => {
	try {
		const resource = await Resource.findByIdAndUpdate(req.params.id,
			{
				$set: {
					file: req.body.file
				}
			},
			{ new: true }
		);
		res.status(200).json(resource);
		await s3.deleteObject({
			Key: req.body.oldFileName,
			Bucket: 'edustack.uz'
		});
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache(['resource', 'resource_all', `resource_${req.params.id}`]);
});

router.delete('/:id', [auth, creator], async (req, res) => {
	try {
		await Resource.findByIdAndDelete(req.params.id);
		res.status(200).json({ success: true });
		await s3.deleteObject({
			Key: req.body.file.fileName,
			Bucket: 'edustack.uz'
		});	
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
	clearCache(['resource', 'resource_all', `resource_${req.params.id}`]);	
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
	clearCache(['resource', 'resource_all', `resource_${req.params.id}`]);
});

router.get('/rating/:userId/:resourceId', auth, async (req, res) => {
	try {
		const rating = await Resource.findOne({ _id: req.params.resourceId }, { ratedUsers: { $elemMatch: { user: req.params.userId } } })
			.select("_id +ratedUsers").lean();
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


/*
	generates pre signed url to download the resource
*/
router.post('/download', auth, async (req, res) => {
	try {
		const file = req.body.file.fileName;
		const url = s3.getSignedUrl('getObject', {
						 Bucket: 'edustack.uz',
						 Key: file,
						 Expires: 3600
					});
		res.status(200).json({ url: url });
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/search/:text', auth, async (req, res) => {
	try {
		const search = await Resource.find(
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