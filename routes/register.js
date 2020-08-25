const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { clearCache } = require('../helpers/customFuncs');
const axios = require('axios');

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

		const vToken = Math.floor(Math.random() * 900000) + 100000;

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
		user.vToken = vToken;

		// here send vToken to the given email
		let data = {
		    senderMail: "edustack.help@gmail.com",
		    senderName: "EduStack.uz",
		    receiverEmail: `${req.body.email}`,
		    receiverName: `${req.body.firstName} ${req.body.lastName}`,
		    replyTo: "edustack.help@gmail.com",
		    subject: "EduStack.uz tasdiqlash kodi",
		    body: `<h3>Assalomu alaykum! EduStack.uz ga xush kelibsiz! </h3> <br /> <h5>Kod: ${vToken}</h5> <br /><p>Biz bilan bo'lganingizdan mamnunmiz!</p>`,
		    altBody: `Assalomu alaykum! EduStack.uz ga xush kelibsiz! Kod: ${vToken}.  Biz bilan bo'lganingizdan mamnunmiz!`,
		    token: "1w4@ka5q.#s!84ad^6Os0hs-Cjs#f9"
		}

        axios.post('https://php-mailer-me.herokuapp.com/api/mailer/mailer.php', JSON.stringify(data))
			    .then((res) => {
			    	// nothing to do
			    }).catch((err) => {
			        return res.status(400).json({ message: err });
			    });
		
		const saved = await user.save();
		res.status(200).json(saved.toJSON());
	}
	catch(err) {
		res.status(400).json( { message: err.message } );
	}
	clearCache(['user_all']);
});

module.exports = router;