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
		let user = await User.findOne({ email: req.body.email }).select('+notification +lastNotificationCount');
		
		if(!user) {
			return res.status(400).json({ message: 'Invalid email or password.' });
		}

		const match = await bcrypt.compare(req.body.password, user.password);
		if(match) {
			user.notificationCount = user.notification.length - user.lastNotificationCount;
			user.lastNotificationCount = user.notification.length;
			await user.save();
			res.status(200).header('x-token', user.genToken()).json(user.toJSON());
		}
		else {
			res.status(400).json({ message: 'Invalid email or password.' });
		}
	}
	catch (err) {
		console.log(err);
		res.status(400).json({ message: err.message });
	}
});


module.exports = router;