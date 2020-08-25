const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const _ = require('lodash');
const bcrypt = require('bcrypt');


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "https://www.edustack.uz"); // update to match the domain you will make the request from
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
			if(user.isVerified) {
				return res.status(200).header('x-token', user.genToken()).json(user.toJSON());
			}

			res.status(200).json(user.toJSON());
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

router.post('/verify', async (req, res) => {
	try {
		let user = await User.findById(req.body._id).select('+vToken +tryCount');
		const match = await bcrypt.compare(req.body.password, user.password);

		if(!match) {
			return res.status(400).json({ message: 'Incorrect password.' });
		}

		if(user.vToken === req.body.vToken) {
			user.isVerified = true;
		}
		else {
			user.tryCount -= 1;
			if(user.tryCount < 1) {
				await User.findByIdAndDelete(req.body._id);
				return res.status(400).json({ message: 'Your account has been deleted' });
			}
			else {
				await user.save();
				return res.status(400).json({ message: 'Verification failed.' });
			}
		}
		await user.save();
		res.status(200).header('x-token', user.genToken()).json({ success: true });
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

module.exports = router;