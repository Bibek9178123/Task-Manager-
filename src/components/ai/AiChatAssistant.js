import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  styled,
  keyframes,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Psychology,
  AutoAwesome,
} from '@mui/icons-material';
import { sendChatMessage, analyzeUserTasks } from '../../services/aiService';
import { toast } from 'react-toastify';

// Animations
const typing = keyframes`
  0%, 60%, 100% { opacity: 0.7; }
  30% { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const ChatContainer = styled(Card)(({ theme }) => ({
  height: '500px',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  borderRadius: '20px',
  overflow: 'hidden',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '3px',
  },
}));

const MessageBubble = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.5),
  maxWidth: '80%',
  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isUser ? 'white' : theme.palette.text.primary,
  marginLeft: isUser ? 'auto' : 0,
  marginRight: isUser ? 0 : 'auto',
  animation: `${slideUp} 0.3s ease-out`,
  boxShadow: theme.shadows[2],
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  '& .dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    margin: '0 2px',
    animation: `${typing} 1.4s infinite ease-in-out`,
    '&:nth-of-type(1)': { animationDelay: '-0.32s' },
    '&:nth-of-type(2)': { animationDelay: '-0.16s' },
  },
}));

const QuickAction = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const AiChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI productivity assistant. I can help you analyze your tasks, provide productivity tips, or answer questions about task management. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(message);
      
      setTimeout(() => {
        setIsTyping(false);
        const aiMessage = {
          id: Date.now() + 1,
          text: response.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000); // Simulate typing delay

    } catch (error) {
      setIsTyping(false);
      console.error('AI Chat error:', error);
      
      let errorText = "I'm sorry, I'm having trouble responding right now. Please try again later.";
      
      if (error.response?.status === 401) {
        errorText = "Please log in to use the AI assistant.";
        toast.error('Please log in to use AI features');
      } else if (error.response?.status === 404) {
        errorText = "AI service is currently unavailable. Please try again later.";
        toast.error('AI service unavailable');
      } else {
        toast.error('Failed to get AI response');
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleQuickAction = async (action) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'analyze':
          const analysis = await analyzeUserTasks();
          const analysisMessage = {
            id: Date.now(),
            text: `Here's your task analysis:\n\n${analysis.analysis}`,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, analysisMessage]);
          break;
        case 'tips':
          sendMessage('Give me 3 productivity tips based on my current tasks');
          break;
        case 'schedule':
          sendMessage('Help me plan my day with my current tasks');
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to perform action');
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { id: 'analyze', label: 'Analyze My Tasks', icon: <Psychology /> },
    { id: 'tips', label: 'Productivity Tips', icon: <AutoAwesome /> },
    { id: 'schedule', label: 'Plan My Day', icon: <SmartToy /> },
  ];

  return (
    <ChatContainer>
      {/* Header */}
      <Box sx={{ p: 2, background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <SmartToy />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              AI Assistant
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Your productivity companion
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
          Quick Actions:
        </Typography>
        <Box display="flex" flexWrap="wrap">
          {quickActions.map((action) => (
            <QuickAction
              key={action.id}
              icon={action.icon}
              label={action.label}
              onClick={() => handleQuickAction(action.id)}
              disabled={isLoading}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Box>

      {/* Messages */}
      <MessagesContainer>
        <List sx={{ py: 0 }}>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ display: 'block', py: 0.5 }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: message.isUser ? 'primary.main' : 'grey.300',
                    order: message.isUser ? 2 : 1,
                  }}
                >
                  {message.isUser ? <Person /> : <SmartToy />}
                </Avatar>
                <MessageBubble isUser={message.isUser}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      lineHeight: 1.4,
                      color: message.isError ? 'error.main' : 'inherit'
                    }}
                  >
                    {message.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 0.5, 
                      opacity: 0.7,
                      fontSize: '0.7rem'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </MessageBubble>
              </Box>
            </ListItem>
          ))}
          
          {isTyping && (
            <ListItem sx={{ display: 'block', py: 0.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>
                  <SmartToy />
                </Avatar>
                <Paper sx={{ p: 1.5, borderRadius: '18px 18px 18px 4px', bgcolor: 'grey.100' }}>
                  <TypingIndicator>
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      AI is typing
                    </Typography>
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </TypingIndicator>
                </Paper>
              </Box>
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <form onSubmit={handleSubmit}>
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              ref={inputRef}
              fullWidth
              variant="outlined"
              placeholder="Ask me anything about productivity or task management..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '25px',
                  backgroundColor: '#f8f9fa',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !inputMessage.trim()}
              sx={{
                minWidth: 'auto',
                borderRadius: '50%',
                width: 48,
                height: 48,
                p: 0,
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Send />
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </ChatContainer>
  );
};

export default AiChatAssistant;
