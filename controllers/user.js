//controllers/user
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const escape = require('escape-html');
const dotEnv=require("dotenv").config();

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return emailRegex.test(email);
};

exports.signup = (req, res, next) => {
  const email = escape(req.body.email);
  const password = req.body.password; 

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Invalid password' });
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
      res.status(500).json({ error: error.message });
    });
};

exports.login = (req, res, next) => {
   const email = escape(req.body.email);
   User.findOne({ email: email })
       .then(user => {
           if (!user) {
               return res.status(401).json({ error: 'User not found' });
           }
		   const JWT_SECRET = process.env.JWT_SECRET;
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ error: 'Incorrect password' });
                   }
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                           { userId: user._id },
                           JWT_SECRET,
                           { expiresIn: '24h' }
                       )
                   });
               })
               .catch(error => res.status(500).json({ error: error.message }));
       })
       .catch(error => res.status(500).json({ error: error.message }));
};

// Test function to verify email validation
exports.testEmailValidation = (email) => {
  console.log(`Testing email: ${email}`);
  console.log(`Is valid: ${validateEmail(email)}`);
};

