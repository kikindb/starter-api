const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('./../models/user');

module.exports = async function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    const me = await User.findById(req.user._id).select(['-password', '-createdAt', '-isActive', '-role']);
    if (!me) return res.status(401).send('The user does not exist');
    next();
  } catch (ex) {
    res.status(400).send('Invalid Token.');
  }
}