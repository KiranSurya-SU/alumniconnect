require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const eventRoutes = require('./routes/events');
const forumRoutes = require('./routes/forum');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumni_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  // Leave a chat room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
  });

  // Handle private messages
  socket.on('private_message', ({ roomId, message, sender }) => {
    io.to(roomId).emit('receive_message', {
      message,
      sender,
      timestamp: new Date()
    });
  });

  // Handle typing status
  socket.on('typing', ({ roomId, user }) => {
    socket.to(roomId).emit('user_typing', user);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/forum', forumRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Alumni Association Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});