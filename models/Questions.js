const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true
	},
	creator: {
		_id: String,
		fullName: String,
		avatar: String
	},
	answers: {
		type: [{}]
	},
	views: {
		type: Number,
		default: 0
	},
	likes: {
		type: Number,
		default: 0
	},
	category: {
		type: String,
		required: true
	},
	isAnswered: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Questions', questionSchema);