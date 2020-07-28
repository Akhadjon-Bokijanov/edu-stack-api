const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const auth = require('../helpers/auth');
const { admin } = require('../helpers/admin');


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Expose-Headers", "x-token" );
	res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE');
	next();
});


router.get('/all', [auth, admin], async (req, res) => {
	try {
		const users = await User.find().select("-password").sort({ registeredDate: -1 }).lean();
		res.status(200).json(users);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});

router.get('/:id', auth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password -cartList -wishList").lean();
		res.status(200).json(user);
	}
	catch (err) {
		res.status(400).json({ message: err.message });
	}
});


module.exports = router;