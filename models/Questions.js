const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true
	},
	description: String,
	creator: {
		_id: String,
		fullName: String,
		avatar: String
	},
	answers: {
		type: [{}]
	},
	categories: {
		type: [String],
		required: true
	},
	isAnswered: {
		type: Boolean,
		default: false
	},
	date: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

questionSchema.index({ question: 'text', categories: 'text' });

module.exports = mongoose.model('Questions', questionSchema);