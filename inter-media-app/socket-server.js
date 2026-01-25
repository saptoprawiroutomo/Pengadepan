const { createServer } = require('http');
const { Server } = require('socket.io');

// Create HTTP server with basic response
const httpServer = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inter Media Chat Server</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { color: #22c55e; font-weight: bold; }
        .info { background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Inter Media Chat Server</h1>
        <p class="status">✅ Socket.IO Server Running</p>
        <div class="info">
          <h3>📡 Server Information:</h3>
          <ul>
            <li><strong>Port:</strong> ${process.env.SOCKET_PORT || 3001}</li>
            <li><strong>Status:</strong> Active</li>
            <li><strong>Purpose:</strong> Real-time Chat Support</li>
            <li><strong>Web App:</strong> <a href="https://bookish-yodel-7xg75gj4pgvhp64g-3000.app.github.dev/">Access Main App</a></li>
          </ul>
        </div>
        <p><strong>Note:</strong> This is the backend chat server. Access the main application at port 3000.</p>
      </div>
    </body>
    </html>
  `);
});

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://bookish-yodel-7xg75gj4pgvhp64g-3000.app.github.dev"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', ({ roomId, message }) => {
    socket.to(roomId).emit('new-message', message);
    console.log(`Message sent to room ${roomId}:`, message.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
