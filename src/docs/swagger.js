// src/docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '백년가게 API',
      version: '1.0.0',
      description: 'Stores / Geocode / Nearby endpoints',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local' },
    ],
    components: {
      schemas: {
        Store: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            seqNo: { type: 'integer', nullable: true },
            name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            sido: { type: 'string', nullable: true },
            sigungu: { type: 'string', nullable: true },
            addr1: { type: 'string', nullable: true },
            addr2: { type: 'string', nullable: true },
            category: { type: 'string', nullable: true },
            lat: { type: 'number', format: 'double', nullable: true },
            lng: { type: 'number', format: 'double', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        NearbyItem: {
          allOf: [
            { $ref: '#/components/schemas/Store' },
            { type: 'object', properties: { distance_km: { type: 'number' } } }
          ]
        }
      }
    }
  },
  // JSDoc 주석을 파싱할 파일들(라우트/컨트롤러 경로 지정)
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = { swaggerSpec };
