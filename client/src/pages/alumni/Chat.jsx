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
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Send as SendIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { setActiveRoom, addMessage } from '../../store/slices/chatSlice';
import chatService from '../../services/chatService';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, activeRoom, typingUsers, loading } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mentoringSessions, setMentoringSessions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chatService.init(dispatch);
    const defaultRoom = 'alumni-general';
    dispatch(setActiveRoom(defaultRoom));
    chatService.joinRoom(defaultRoom);

    return () => {
      chatService.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
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

  const handleScheduleMentoring = () => {
    setOpenSchedule(true);
  };

  const handleCloseSchedule = () => {
    setOpenSchedule(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const room = newValue === 0 ? 'alumni-general' : `mentoring-${user.id}`;
    dispatch(setActiveRoom(room));
    chatService.joinRoom(room);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="General Chat" />
            <Tab label="Mentoring Sessions" />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<ScheduleIcon />}
                onClick={handleScheduleMentoring}
              >
                Schedule Mentoring Session
              </Button>
            </Box>

            <List>
              {mentoringSessions.map((session, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Session with ${session.studentName}`}
                    secondary={`${session.date} - ${session.time}`}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const room = `mentoring-${session.id}`;
                      dispatch(setActiveRoom(room));
                      chatService.joinRoom(room);
                    }}
                  >
                    Join Session
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      <Dialog open={openSchedule} onClose={handleCloseSchedule}>
        <DialogTitle>Schedule Mentoring Session</DialogTitle>
        <DialogContent>
          {/* Add form for scheduling mentoring session */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSchedule}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseSchedule}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat;