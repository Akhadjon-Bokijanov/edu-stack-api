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
	organisation: {
		type: String,
		default: " "
	},
	occupation: {
		type: String,
		default: 'student'
	},
	testScores: [{}],
	dateOfBirth: {
		type: String,
		default: null
	},
	skills: [{}],
	description: {
		type: String
	},
	vToken: String,
	contact: String,
	registeredDate: {
		type: Date,
		default: Date.now
	},
	reputation: {
		type: Number,
		default: 0
	},
	wishList: {
		type: [{}]
	},
	cartList: {
		type: [{}]
	},
	background: {
		type: [{}]
	},
	notification: {
		type: [{}],
		default: [],
		select: false
	},
	notificationCount: {
		type: Number,
		default: 0
	},
	// notification count without isRead
	lastNotificationCount: {
		type: Number,
		default: 0,
		select: false
	},
	followers: [{
		_id: String,
		fullName: String,
		avatar: String
	}],
	following: [{
		_id: String,
		fullName: String,
		avatar: String
	}]
});


userSchema.methods.genToken = function() {
	const token = jwt.sign(
		_.pick(this, ['_id', 'firstName', 'lastName', 'email', 'role', 'avatar']), 
		process.env.jwtPrivateKey);
	return token;
}

userSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
}

module.exports = mongoose.model('Users', userSchema);