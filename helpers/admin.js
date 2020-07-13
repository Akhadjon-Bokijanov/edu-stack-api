// admins created manually for now
const News = require('../models/News');


function admin(req, res, next) {   
  if (req.user.role.toLowerCase() != 'admin') return res.status(403).json({ message: 'Access denied.' });
  next();
}

function collaborator(req, res, next) {
	if(req.user.role.toLowerCase() == 'collaborator' || req.user.role.toLowerCase() == 'admin') {
		next();
	}
	else {
		return res.status(403).json({ message: 'Access denied.' });
	}
}

function creator(req, res, next) {
	if(req.user.role.toLowerCase() == 'admin' || req.user._id == req.body.creatorId) {
		next();
	}
	else {
		return res.status(403).json({ message: 'Access denied.' });
	}
}

module.exports = {
	admin: admin,
	collaborator: collaborator,
	creator: creator
};