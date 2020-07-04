const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });

router.post('/', async (req, res) => {
	try {
		let user = new User(
			_.pick(req.body, ['firstName', 'lastName', 'email', 'password', 'role']));
		const check = await User.findOne({ email: req.body.email });
		if(check) {
			return res.status(400).send('This email already exists.');
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
		const saved = await user.save();
		res.header('x-token', user.genToken()).json(_.pick(saved, ['firstName', 'lastName', 'email', 'role']));
	}
	catch(err) {
		res.status(400).json( { message: err.message } );
	}
});

module.exports = router;