const express = require('express');
const router = express.Router();


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-token");
	res.header("Access-Control-Allow-Methods", "GET, PATCH, DELETE, POST");
	next();
});

router.get('/', async (req, res) => {
	try {
		res.status(200).json({
			"test": "success"
		});
	}
	catch(err) {
		res.status(400).json({ message : err });
	}
});

module.exports = router;