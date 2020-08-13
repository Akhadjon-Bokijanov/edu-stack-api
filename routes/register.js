const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { clearCache } = require('../helpers/customFuncs');

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://www.edustack.uz"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Expose-Headers", "x-token" )
	next();
  });

router.post('/', async (req, res) => {
	try {
		let user = new User(
			_.pick(req.body, ['firstName', 'lastName', 'email', 'password', 'role']));
		const check = await User.findOne({ email: req.body.email });
		if(check) {
			return res.status(400).json({ message: 'This email already exists.' });
		}
		if(req.body.role.toLowerCase() == 'admin') {
			return res.status(403).json({ message: "Try other ways to become an admin" });
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
		const saved = await user.save();
		res.header('x-token', user.genToken()).json(saved.toJSON());
	}
	catch(err) {
		res.status(400).json( { message: err.message } );
	}
	clearCache(['user_all']);
});

module.exports = router;