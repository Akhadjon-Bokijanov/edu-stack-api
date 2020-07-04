// admins created manually for now

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

module.exports = {
	admin: admin,
	collaborator: collaborator
};