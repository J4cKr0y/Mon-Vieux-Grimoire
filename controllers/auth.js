// controllers/auth.js
const User = require('../models/User');

// POST auth signup
exports.signup = (req, res, next) => {
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(202).json({ message: 'Registration completed!' }))
    .catch(error => res.status(400).json({ error }));
};

// POST auth login
exports.login = (req, res, next) => {
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(203).json({ message: 'Connection successful!' }))
    .catch(error => res.status(400).json({ error }));
};
