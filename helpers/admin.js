// admins created manually for now
const News = require('../models/News');


function admin(req, res, next) {   
  if (req.user.role != 'admin') return res.status(403).send('Access denied.');
  next();
}

function collaborator(req, res, next) {
	if(req.user.role == 'collaborator' || req.user.role == 'admin') {
		next();
	}
	else {
		return res.status(403).send('Access denied.');
	}
}

function newsCreator(req, res, next) {
	if(req.user.role == 'admin' || req.user._id == req.body.creatorId) {
		next();
	}
	else {
		return res.status(403).send('Access denied.');
	}
}

module.exports = {
	admin: admin,
	collaborator: collaborator,
	newsCreator: newsCreator
};