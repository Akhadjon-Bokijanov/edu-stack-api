const mongoose = require('mongoose');
const { Schema } = mongoose;

const exerciseSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: String,
	cost: {
		type: Number,
		default: 0
	},
	time: {
		type: Number,
		required: true
	},
	inputFields: {
		type: [{}],
		required: true
	},
	isPrivate: {
		type: Boolean,
		default: false
	},
	date: {
		type: Date,
		default: Date.now
	},
	type: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	creator: {
		_id: String,
		fullName: String,
		avatar: String
	}
});

exerciseSchema.index({ title: 'text', category: 'text' });

module.exports = mongoose.model('Exercises', exerciseSchema);