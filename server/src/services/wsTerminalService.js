// WebSocket terminal streaming service
// Provides real-time execution output via Socket.io

const { executeCode } = require('./sandboxService');

const setupTerminalSocket = (io) => {
  const terminalNamespace = io.of('/terminal');
  
  terminalNamespace.on('connection', (socket) => {
    console.log('[Terminal WS] Client connected:', socket.id);

    socket.on('execute', async (data) => {
      const { code, language, sessionId } = data;
      
      // Emit execution started
      socket.emit('terminal:start', { message: '⏳ Starting execution...', timestamp: Date.now() });
      
      try {
        // Stream execution in chunks (simulated for real-time feel)
        socket.emit('terminal:output', { 
          data: `$ docker run --rm -it ${language === 'javascript' ? 'node:18-alpine' : language === 'python' ? 'python:3.10-alpine' : language === 'java' ? 'openjdk:11' : 'gcc:latest'}\n`,
          type: 'system',
          timestamp: Date.now()
        });

        await new Promise(r => setTimeout(r, 200));

        socket.emit('terminal:output', { 
          data: `⚙️ Compiling ${language} code...\n`,
          type: 'system',
          timestamp: Date.now()
        });

        await new Promise(r => setTimeout(r, 300));

        const result = await executeCode(code, language);

        if (result.output) {
          socket.emit('terminal:output', { 
            data: result.output + '\n',
            type: 'stdout',
            timestamp: Date.now()
          });
        }

        if (result.error) {
          socket.emit('terminal:output', { 
            data: result.error + '\n',
            type: 'stderr',
            timestamp: Date.now()
          });
        }

        socket.emit('terminal:done', {
          success: result.success,
          exitCode: result.exitCode,
          executionTime: result.executionTime,
          message: result.success ? '✅ Process exited with code 0' : `❌ Process exited with code ${result.exitCode}`,
          timestamp: Date.now()
        });

      } catch (error) {
        socket.emit('terminal:error', {
          message: error.message,
          timestamp: Date.now()
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Terminal WS] Client disconnected:', socket.id);
    });
  });
};

module.exports = { setupTerminalSocket };