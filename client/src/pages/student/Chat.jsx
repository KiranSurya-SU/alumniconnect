import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { setActiveRoom, addMessage } from '../../store/slices/chatSlice';
import chatService from '../../services/chatService';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, activeRoom, typingUsers, loading } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize chat service
    chatService.init(dispatch);

    // Join default room (can be modified for different chat rooms)
    const defaultRoom = 'general';
    dispatch(setActiveRoom(defaultRoom));
    chatService.joinRoom(defaultRoom);

    return () => {
      chatService.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && activeRoom) {
      const messageData = {
        text: message,
        sender: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        },
        timestamp: new Date()
      };

      chatService.sendMessage(activeRoom, messageData);
      dispatch(addMessage(messageData));
      setMessage('');
    }
  };

  const handleTyping = () => {
    chatService.sendTypingStatus(activeRoom, `${user.firstName} ${user.lastName}`);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">Chat Room</Typography>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" sx={{
                    flexDirection: msg.sender.id === user.id ? 'row-reverse' : 'row'
                  }}>
                    <ListItemAvatar>
                      <Avatar>{msg.sender.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={msg.sender.name}
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {msg.text}
                        </Typography>
                      }
                      sx={{
                        '& .MuiListItemText-primary': {
                          textAlign: msg.sender.id === user.id ? 'right' : 'left'
                        },
                        '& .MuiListItemText-secondary': {
                          backgroundColor: msg.sender.id === user.id ? 'primary.light' : 'grey.100',
                          padding: 1,
                          borderRadius: 1,
                          display: 'inline-block',
                          maxWidth: '70%'
                        }
                      }}
                    />
                  </ListItem>
                  {index < messages.length - 1 && <Divider variant="inset" />}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}

          {typingUsers.length > 0 && (
            <Typography variant="caption" sx={{ pl: 2, color: 'text.secondary' }}>
              {typingUsers.join(', ')} is typing...
            </Typography>
          )}
        </Box>

        <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, backgroundColor: 'background.paper' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleTyping}
              size="small"
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!message.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;