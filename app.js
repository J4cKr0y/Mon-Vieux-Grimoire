//app.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotEnv=require("dotenv").config();
const User = require('./models/user'); 
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const auth = require('./middleware/auth');
const limitTryByIP = require('./middleware/limitTryByIP');
const path = require('path');
const checkWritePermission = require('./middleware/checkWritePermission');
const imagesDir = path.join(__dirname, 'images');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerSetup = require('./swagger');
const morgan = require('morgan');

app.use(limitTryByIP);
app.use(morgan('dev'));
app.use(express.json());
app.use(mongoSanitize());
app.disable('x-powered-by');


const mongodbURI = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_URL}`;
mongoose.connect(mongodbURI, {})
  .then(() => console.log('Connected to Database. Welcome.'))
  .catch(() => console.log('Failed to connect to Database !'));

// Middleware ajoutant les headers pour éviter l'erreur CORS (Cross Origin Resource Sharing) + affichage caractères spéciaux
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('content-type', 'text/html; charset=utf-8');
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', booksRoutes);
app.use('/api/books', checkWritePermission(imagesDir));
app.use('/api/auth', userRoutes);

// Middleware POST auth signup
app.post('/api/auth/signup', (req, res, next) => {
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(202).json({ message: 'Registration completed!' }))
    .catch(error => res.status(400).json({ error }));
});

// Middleware POST auth login
app.post('/api/auth/login', (req, res, next) => {
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(203).json({ message: 'Connection successful!' }))
    .catch(error => res.status(400).json({ error }));
});

// Middleware POST id rating
app.post('/api/books/:id/rating', (req, res, next) => {
  delete req.body._id;
  const rate = new Rate({
    ...req.body
  });
  rate.save()
    .then(() => res.status(201).json({ message: 'Vote recorded!' }))
    .catch(error => res.status(400).json({ error }));
});

// Middleware GET books bestrating
app.get('/api/books/bestrating', (req, res, next) => {
  Bestrate.find()
    .then(bestrating => res.status(200).json(bestrating))
    .catch(error => res.status(400).json({ error }));
});

module.exports = app;

swaggerSetup(app);

