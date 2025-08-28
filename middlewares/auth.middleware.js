const jwt = require('jsonwebtoken');
const { User } = require('../models/model.js');

const secret = process.env.JWT_SECRET || 'Deepak1242';

function signToken(user) {
  const payload = { id: user.id, role: user.role, email: user.email };
  return jwt.sign(payload, secret, { expiresIn: '6h' });
}

async function authMiddleware(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'No token found' });
  try {
    const payload = jwt.verify(token, secret);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authMiddleware, signToken };
