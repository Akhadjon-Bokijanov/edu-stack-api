const express = require('express');
const router = express.Router();

const auth = require('../helpers/auth');
const User = require('../models/Users');
const Question = require('../models/Questions');
const { admin, collaborator, creator } = require('../helpers/admin');

router.get('/', async (req, res) => {
	try {
		const questions = await Question.find().limit(50).lean();
		res.status(200).json(questions);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:category', async (req, res) => {
	try {
		const questions = await Question.find({category: req.params.category}).lean();
		res.status(200).json(questions);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});