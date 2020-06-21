const mongoose = require('mongoose');

const NewsSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	image_url: String,
	organization: String,
	category: String,
	date: {
		type: Date,
		default: Date.now
	},
	importance: String
});

module.exports = mongoose.model('News', NewsSchema);