//controllers/user
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

exports.signup = (req, res, next) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error });
  }

  bcrypt.hash(password, 10)
    .then(hash => {
      const user = new User({
        email: email,
        password: hash
      });
      return user.save();
    })
    .then(() => res.status(201).json({ message: 'User created!' }))
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.login = (req, res, next) => {
   User.findOne({ email: req.body.email })
       .then(user => {
           if (!user) {
               return res.status(401).json({ error });
           }
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ error });
                   }
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                           { userId: user._id },
                           'RANDOM_TOKEN_SECRET',
                           { expiresIn: '24h' }
                       )
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));
};