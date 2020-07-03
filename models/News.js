const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	imageUrl: String,
	organization: String,
	category: String,
	date: {
		type: Date,
		default: Date.now
	},
	isImportant: {
		type: Boolean,
		default: false
	},
	status: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('News', NewsSchema);