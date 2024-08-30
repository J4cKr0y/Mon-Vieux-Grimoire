//app.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const z_mongodb = require('./z_mongodb.js');
const User = require('./models/user'); 
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const auth = require('./middleware/auth');
const path = require('path');
app.use(express.json());

mongoose.connect(z_mongodb.mongodbURI, {})
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware ajoutant les headers pour éviter l'erreur CORS (Cross Origin Resource Sharing) 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);

// Middleware POST auth signup
app.post('/api/auth/signup', (req, res, next) => {
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(202).json({ message: 'Inscription effectuée !' }))
    .catch(error => res.status(400).json({ error }));
});

// Middleware POST auth login
app.post('/api/auth/login', (req, res, next) => {
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(203).json({ message: 'Connexion réussie !' }))
    .catch(error => res.status(400).json({ error }));
});

// Middleware POST id rating
app.post('/api/books/:id/rating', (req, res, next) => {
  delete req.body._id;
  const rate = new Rate({
    ...req.body
  });
  rate.save()
    .then(() => res.status(201).json({ message: 'Vote enregistré !' }))
    .catch(error => res.status(400).json({ error }));
});

// Middleware GET books bestrating
app.get('/api/books/bestrating', (req, res, next) => {
  Bestrate.find()
    .then(bestrating => res.status(200).json(bestrating))
    .catch(error => res.status(400).json({ error }));
});

module.exports = app;

