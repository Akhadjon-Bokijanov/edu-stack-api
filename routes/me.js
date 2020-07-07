const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const _ = require('lodash');
const auth = require('../helpers/auth');


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Expose-Headers", "x-token" )
	next();
  });


router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-_id -password');
		res.status(200).json(user);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});


module.exports = router;