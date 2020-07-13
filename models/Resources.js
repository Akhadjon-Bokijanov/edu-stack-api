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
		type: String
		//required: true
	},
	creatorId: String,
	date: {
		type: Date,
		default: Date.now
	},
	file: String
});


module.exports = mongoose.model('Resources', resourceSchema);