const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	detail: {
		type: String
	},
	date:{
		type: Date,
		default: Date.now 
	},
	lessons: {
		type: [{}],
		default: [],
		select: false
	},
	cost: {
		type: Number,
		default: 0
	},
	previewImage: {
		type: String
	},
	paidUsers: {
		type: [String],
		default: [],
		select: false
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
	ratedUsers: {
		type: [String],
		default: [],
		select: false
	},
	categories: {
		type: [String],
		required: true
	},
	userCount: {
		type: Number,
		default: 0
	},
	creator: {
		_id: String,
		fullName: String,
		avatar: String
	}
});

courseSchema.index({ title: 'text', categories: 'text' });

module.exports = mongoose.model('Courses', courseSchema);