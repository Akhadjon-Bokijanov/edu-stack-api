const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	email: {
		type: String,
		required: true
	},
	contact: {
		type: [{}]
	},
	location: {
		
	}
});