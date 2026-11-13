const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const setupSockets = require('./sockets');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL === '*' ? '*' : env.CLIENT_URL.split(','),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Setup Socket.IO handlers
setupSockets(io);

// Attach socket.io to app for controller access if needed
app.set('io', io);

// Start database & server
const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();

module.exports = { server, io };
