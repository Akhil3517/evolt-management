require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

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

// Add a database test route
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      message: 'Database connection test',
      status: dbStateMap[dbState] || 'unknown',
      readyState: dbState,
      isConnected: dbState === 1
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database test failed',
      error: error.message
    });
  }
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
        url: process.env.NODE_ENV === 'production' 
          ? 'https://evolt-management.vercel.app/api'
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
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

// Serve Swagger UI with custom options
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "EVolt API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    showCommonExtensions: true,
    syntaxHighlight: {
      activated: true,
      theme: "monokai"
    }
  }
}));

// Serve static files for Swagger UI
app.use('/swagger-ui', express.static(path.join(__dirname, '../node_modules/swagger-ui-dist')));

app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);

// Error handling middleware
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Database URI:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Hide credentials in logs
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Swagger documentation available at:', `http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      codeName: err.codeName
    });
    process.exit(1);
  });

// Add connection error handler
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Add disconnection handler
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Add reconnection handler
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
}); 