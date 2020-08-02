const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: String,
	content: {
		type: String,
		required: true
	},
	creator: {
		_id: String,
		fullName: String,
		avatar: String
	},
	date: {
		type: Date,
		default: Date.now
	},
	categories: [String],
	like: {
		type: Number,
		default: 0
	},
	likedUsers: {
		type: [String],
		default: [],
		select: false
	}
});

blogSchema.index({ title: 'text'});

module.exports = mongoose.model('Blogs', blogSchema);