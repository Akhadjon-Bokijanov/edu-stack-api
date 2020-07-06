const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = function (req, res, next) {
  const token = req.header('x-token');
  console.log('token ', token);
  if (!token) return res.status(401).send('Access denied.');

  try {
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded; 
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}