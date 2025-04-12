const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.onlineUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);

      socket.on('join_room', (roomId) => this.handleJoinRoom(socket, roomId));
      socket.on('leave_room', (roomId) => this.handleLeaveRoom(socket, roomId));
      socket.on('private_message', (data) => this.handlePrivateMessage(socket, data));
      socket.on('typing', (data) => this.handleTyping(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  async handleConnection(socket) {
    const userId = socket.user._id;
    this.onlineUsers.set(userId.toString(), socket.id);
    this.userSockets.set(socket.id, userId.toString());

    // Broadcast updated online users list
    this.broadcastOnlineUsers();

    console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);
  }

  handleJoinRoom(socket, roomId) {
    socket.join(roomId);
    console.log(`User ${socket.user._id} joined room: ${roomId}`);
  }

  handleLeaveRoom(socket, roomId) {
    socket.leave(roomId);
    console.log(`User ${socket.user._id} left room: ${roomId}`);
  }

  async handlePrivateMessage(socket, { roomId, message, sender }) {
    try {
      // Save message to database
      const newMessage = new Message({
        roomId,
        sender: socket.user._id,
        text: message.text,
        attachments: message.attachments || []
      });
      await newMessage.save();

      // Broadcast message to room
      this.io.to(roomId).emit('receive_message', {
        ...message,
        sender: {
          id: socket.user._id,
          name: `${socket.user.firstName} ${socket.user.lastName}`
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling private message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTyping(socket, { roomId, user }) {
    socket.to(roomId).emit('user_typing', user);
  }

  handleDisconnect(socket) {
    const userId = this.userSockets.get(socket.id);
    if (userId) {
      this.onlineUsers.delete(userId);
      this.userSockets.delete(socket.id);
      this.broadcastOnlineUsers();
    }
    console.log(`User disconnected: ${userId}`);
  }

  broadcastOnlineUsers() {
    const onlineUserIds = Array.from(this.onlineUsers.keys());
    this.io.emit('online_users', onlineUserIds);
  }
}

module.exports = SocketManager;