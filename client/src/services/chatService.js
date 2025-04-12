import io from 'socket.io-client';
import { addMessage, setTypingUser, updateOnlineUsers } from '../store/slices/chatSlice';

class ChatService {
  constructor() {
    this.socket = null;
    this.store = null;
  }

  init(store) {
    this.store = store;
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('receive_message', (message) => {
      this.store.dispatch(addMessage(message));
    });

    this.socket.on('user_typing', (user) => {
      this.store.dispatch(setTypingUser({ user, isTyping: true }));
      // Clear typing indicator after 2 seconds
      setTimeout(() => {
        this.store.dispatch(setTypingUser({ user, isTyping: false }));
      }, 2000);
    });

    this.socket.on('online_users', (users) => {
      this.store.dispatch(updateOnlineUsers(users));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  sendMessage(roomId, message, sender) {
    if (this.socket) {
      this.socket.emit('private_message', { roomId, message, sender });
    }
  }

  sendTypingStatus(roomId, user) {
    if (this.socket) {
      this.socket.emit('typing', { roomId, user });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new ChatService();