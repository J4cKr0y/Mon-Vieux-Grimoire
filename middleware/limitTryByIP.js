//middleware/limitTryByIP.js
const rateLimit = require('express-rate-limit');

const limitTryByIP = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Speed limit exceeded, please try again in 15 minutes.',
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = limitTryByIP ;