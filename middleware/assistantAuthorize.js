const isAssistant = (req, res, next) => {
  if (req.user && req.user.role === 'Assistant') {
    next();
  } else {
    res.status(401).send({ message: 'Invalid  Assistant Token' });
  }
};

module.exports = isAssistant;
