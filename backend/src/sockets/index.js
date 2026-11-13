const jwt = require('jsonwebtoken');
const env = require('../config/env');
const registerChatHandlers = require('./chat.socket');

const setupSockets = (io) => {
  // Handshake authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id} for User: ${socket.userId}`);

    // Join personal user notification room
    socket.join(`user:${socket.userId}`);

    // Register chat event handlers
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSockets;
