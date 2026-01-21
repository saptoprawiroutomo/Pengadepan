const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
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
