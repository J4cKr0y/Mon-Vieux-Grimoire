const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
module.exports = (app) => {
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
/*
//YAML VERSION
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const yamljs = require('yamljs');
const swaggerDocs = yamljs.load('./swagger.yaml');
const path = require('path');

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
*/