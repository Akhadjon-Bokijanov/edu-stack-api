const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	resourceType: {
		type: String,
		default: 'public'
	},
	costType: {
		type: String,
		default: 'free'
	},
	cost: {
		type: Number,
		default: 0
	},
	category: {
		type: String,
		default: "Other"
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
	file: {
		fileName: String,
		fileType: String,
		fileSize: String
	},
	rating: {
		average: {
			type: Number,
			default: 0
		},
		voters: {
			type: Number,
			default: 0
		}
	},
	views: {
		type: Number,
		default: 0
	},
	ratedUsers: {
		type: [{}],
		select: false
	},
	viewedUsers: {
		type: [String],
		select: false
	}
});


module.exports = mongoose.model('Resources', resourceSchema);