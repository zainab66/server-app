const isPrinciple = (req, res, next) => {
  if (req.user && req.user.role === 'principle') {
    next();
  } else {
    res.status(401).json({ message: 'Invalid  Principle Token' });
  }
};

module.exports = isPrinciple;
