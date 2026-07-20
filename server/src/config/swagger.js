const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrepAgent API',
      version: '1.0.0',
      description: 'AI-powered placement preparation platform API',
      contact: {
        name: 'PrepAgent Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/src/routes/*.js', './server/src/controllers/*.js'], // Path to the API files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  // Swagger endpoint
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCss: '.swagger-ui .topbar { background-color: #1A1A1A; }',
    customSiteTitle: 'PrepAgent API Docs',
    customfavIcon: '/favicon.ico',
  }));

  console.log('📚 Swagger documentation available at http://localhost:5000/api-docs');
};

module.exports = {
  setupSwagger,
  swaggerDocs,
};