// admins created manually for now

function admin(req, res, next) {   
  if (!req.user.info.isAdmin) return res.status(403).send('Access denied.');
  next();
}

function collaborator(req, res, next) {
	if(req.user.info.isCollaborator || req.user.info.isAdmin)  {
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