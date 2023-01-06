const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'isAssistance') {
    next();
  } else {
    res.status(401).send({ message: 'Invalid  Assistance Token' });
  }
};

module.exports = isDoctor;
