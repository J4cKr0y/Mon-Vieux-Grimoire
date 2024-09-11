const fs = require('fs');
const https = require('https');
const app = require('./app');
const dotEnv = require('dotenv').config();

const keyPath = './ssl/private-key.pem';
const certPath = './ssl/certificate.pem';

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('Error: SSL certificate or key file not found.');
  process.exit(1);
}

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.error('SSL certificate and key are here !');
}

fs.access(keyPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`No read access to ${keyPath}`);
  } else {
    console.log(`${keyPath} is readable`);
  }
});

fs.access(certPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`No read access to ${certPath}`);
  } else {
    console.log(`${certPath} is readable`);
  }
});

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = https.createServer(options, app);

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);