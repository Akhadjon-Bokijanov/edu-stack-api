const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
require('dotenv/config');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: false
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	address: {
		type: String,
		trim: true,
		default: "O'zbekiston"
	},
	role: {
		type: String,
		default: "applicant"
	},
	avatar: {
		type: String,
		default: 'uploads/avatars/default.png'
	},
	testScores: [{}]
});


userSchema.methods.genToken = function() {
	const token = jwt.sign(
		_.pick(this, ['_id', 'firstName', 'lastName', 'email', 'role', 'address']), 
		process.env.jwtPrivateKey);
	return token;
}

module.exports = mongoose.model('Users', userSchema);