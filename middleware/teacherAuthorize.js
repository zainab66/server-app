const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(401).json({ message: 'Invalid  Teacher Token' });
  }
};

module.exports = isTeacher;
