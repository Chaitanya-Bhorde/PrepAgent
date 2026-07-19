const { Server } = require('socket.io');
const { processInterviewTurn } = require('./ai/interviewerService');

let io = null;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join session room
    socket.on('joinSession', (sessionId) => {
      socket.join(sessionId);
      console.log(`Client ${socket.id} joined session room: ${sessionId}`);
    });

    socket.on('joinUserRoom', (userId) => {
      socket.join(userId);
      console.log(`Client ${socket.id} joined user room: ${userId}`);
    });

    // Handle real-time candidate messages
    socket.on('sendMessage', async (data) => {
      const { sessionId, message } = data;
      
      try {
        // Broadcast user's typing state
        socket.emit('typing', { isTyping: true });

        // Process message via Interviewer service
        const turnResult = await processInterviewTurn(sessionId, message);

        // Stream AI response and recommendations back to room
        io.to(sessionId).emit('receiveMessage', {
          role: 'assistant',
          content: turnResult.response,
          sender: turnResult.sender,
          suggestions: turnResult.suggestions,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('[Socket] Interview turn failed:', error.message);
        socket.emit('error', { message: 'Failed to process message', error: error.message });
      } finally {
        socket.emit('typing', { isTyping: false });
      }
    });

    // Handle typing events
    socket.on('typing', (data) => {
      const { sessionId, isTyping } = data;
      socket.to(sessionId).emit('typing', { isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { initializeSocket, getIO };

