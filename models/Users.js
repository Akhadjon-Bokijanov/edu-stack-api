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
	info: {
		address: {
			type: String,
			trim: true,
			default: "O'zbekiston"
		},
		postNumber: {
			type: Number,
			default: 0
		},
		isCollaborator: {
			type: Boolean,
			default: true
		}
	}
});


userSchema.methods.genToken = function() {
	const token = jwt.sign(_.pick(this, ['_id', 'firstName', 'lastName', 'email', 'info']), process.env.jwtPrivateKey);
	return token;
}

module.exports = mongoose.model('Users', userSchema);