//app.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotEnv=require("dotenv").config();
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
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
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', checkWritePermission(imagesDir));
app.use('/api/books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;

swaggerSetup(app);

