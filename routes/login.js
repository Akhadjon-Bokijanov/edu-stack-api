const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Expose-Headers", "x-token" )
	next();
  });

router.post('/', async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		if(!user) return res.status(400).send('Invalid email or password.');

		const match = await bcrypt.compare(req.body.password, user.password);
		if(match) {
			res.status(200).header('x-token', user.genToken()).json(user);
		}
		else {
			res.status(400).send('Invalid email or password.');
		}
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

module.exports = router;