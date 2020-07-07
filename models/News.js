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
	imageUrl: {
		type: String,
		default: 'uploads/newsImages/default.png'
	},
	organization: String,
	category: {
		type: String,
		default: "Ta'lim"
	},
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
	},
	creatorId: String,
	detail: {
		type: String
	}
});

module.exports = mongoose.model('News', NewsSchema);