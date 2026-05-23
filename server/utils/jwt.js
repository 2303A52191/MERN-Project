const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'supersecretkeyfortaskflowaiplatform2026',
    { expiresIn: '30d' }
  );
};

module.exports = { generateToken };
