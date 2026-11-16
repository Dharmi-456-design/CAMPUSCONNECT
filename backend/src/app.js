const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting mobile apps and web clients
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, EAS build testing)
      if (!origin) return callback(null, true);
      const allowed = env.CLIENT_URL === '*' ? ['*'] : env.CLIENT_URL.split(',');
      if (allowed.includes('*') || allowed.includes(origin)) {
        return callback(null, true);
      }
      // Allow seamless access for campus mobile and web clients
      return callback(null, true);
    },
    credentials: true,
  })
);

// Logging middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check endpoints for cloud deployment (Render, Railway, Fly.io, etc.)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'CampusOne / CampusConnect API',
    version: '1.0.0',
    health: '/health',
    api: '/api/v1',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});

// Serve static study notes PDFs
app.use('/public', express.static(path.join(__dirname, '../public')));

// Mount API routes (both /api/v1 and /api for backward compatibility)
app.use('/api/v1', routes);
app.use('/api', routes);

// 404 Not Found handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
