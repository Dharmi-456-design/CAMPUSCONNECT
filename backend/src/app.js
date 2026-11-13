const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL === '*' ? '*' : env.CLIENT_URL.split(','),
    credentials: true
  })
);

// Logging middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const path = require('path');

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static study notes PDFs
app.use('/public', express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/api', routes);

// 404 Not Found handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
