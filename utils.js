const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user) => {
  console.log('user', user);
  return jwt.sign(
    {
      _id: user._id,
      // name: user.name,
      email: user.email,
      role: user.role,
      // profilePicture: user.profilePicture,
    },
    process.env.JWT_SIGNIN_KEY || 'somethingsecret',
    {
      expiresIn: '30d',
    }
  );
};

module.exports = generateToken;
