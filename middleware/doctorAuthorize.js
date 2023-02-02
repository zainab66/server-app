const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Invalid  Doctor Token' });
  }
};

module.exports = isDoctor;
