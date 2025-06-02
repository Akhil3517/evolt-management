require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth.routes');
const stationRoutes = require('./routes/station.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['https://evolt-management.vercel.app', 'https://evolt-management-cbj1.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Add error handling for CORS preflight
app.options('*', cors(corsOptions));

// Add a test route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.use(express.json());
app.use(morgan('dev'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EV Charging Station API',
      version: '1.0.0',
      description: 'API documentation for EV Charging Station Management System',
      contact: {
        name: 'API Support',
        email: 'support@evolt.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      },
      schemas: {
        Station: {
          type: 'object',
          required: ['name', 'location', 'powerOutput', 'connectorType'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the charging station'
            },
            location: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  description: 'Latitude coordinate (-90 to 90)'
                },
                longitude: {
                  type: 'number',
                  description: 'Longitude coordinate (-180 to 180)'
                }
              }
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Current status of the station'
            },
            powerOutput: {
              type: 'number',
              description: 'Power output in kilowatts'
            },
            connectorType: {
              type: 'string',
              enum: ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla'],
              description: 'Type of charging connector'
            }
          }
        },
        User: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (min 6 characters)'
            },
            name: {
              type: 'string',
              description: 'User full name'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "EVolt API Documentation",
  customfavIcon: "/favicon.ico"
}));
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 