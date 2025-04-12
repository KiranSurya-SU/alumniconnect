import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for fetching chat history
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/chat/${roomId}/messages`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  messages: [],
  activeRoom: null,
  typingUsers: [],
  onlineUsers: [],
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.messages = [];
      state.typingUsers = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTypingUser: (state, action) => {
      const { user, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typingUsers.includes(user)) {
          state.typingUsers.push(user);
        }
      } else {
        state.typingUsers = state.typingUsers.filter(u => u !== user);
      }
    },
    updateOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.activeRoom = null;
      state.typingUsers = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch chat history';
      });
  }
});

export const {
  setActiveRoom,
  addMessage,
  setTypingUser,
  updateOnlineUsers,
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer;