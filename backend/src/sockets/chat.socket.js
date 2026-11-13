const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Block = require('../models/Block');
const Notification = require('../models/Notification');

const registerChatHandlers = (io, socket) => {
  // Join a conversation room
  socket.on('join_conversation', async ({ conversationId }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return socket.emit('chat_error', { message: 'Conversation not found' });
      }

      if (!conversation.participants.some(p => p.toString() === socket.userId.toString())) {
        return socket.emit('chat_error', { message: 'Not a member of this conversation' });
      }

      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} (User: ${socket.userId}) joined ${roomName}`);
    } catch (err) {
      socket.emit('chat_error', { message: err.message });
    }
  });

  // Send message
  socket.on('send_message', async ({ conversationId, text }) => {
    try {
      if (!text || !text.trim()) {
        return socket.emit('chat_error', { message: 'Message text cannot be empty' });
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return socket.emit('chat_error', { message: 'Conversation not found' });
      }

      const recipientId = conversation.participants.find(p => p.toString() !== socket.userId.toString());

      // Check block status
      if (recipientId) {
        const isBlocked = await Block.findOne({
          $or: [
            { blocker: socket.userId, blocked: recipientId },
            { blocker: recipientId, blocked: socket.userId }
          ]
        });

        if (isBlocked) {
          return socket.emit('chat_error', { message: 'Cannot send message to blocked user' });
        }
      }

      // Persist message
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        text,
        readBy: [socket.userId]
      });

      const populatedMessage = await Message.findById(message._id).populate('sender', 'name photoUrl');

      // Update conversation lastMessage
      conversation.lastMessage = {
        text,
        sender: socket.userId,
        createdAt: message.createdAt
      };
      await conversation.save();

      const roomName = `conversation:${conversationId}`;
      io.to(roomName).emit('receive_message', populatedMessage);

      // Create notification for recipient if present
      if (recipientId) {
        const notification = await Notification.create({
          user: recipientId,
          type: 'chat_message',
          message: `New message from user`,
          relatedId: conversationId
        });

        io.to(`user:${recipientId}`).emit('notification_received', notification);
      }
    } catch (err) {
      socket.emit('chat_error', { message: err.message });
    }
  });

  // Typing indicators
  socket.on('typing_start', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', { userId: socket.userId, isTyping: true });
  });

  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', { userId: socket.userId, isTyping: false });
  });
};

module.exports = registerChatHandlers;
