// Store connected users
let users: { [key: string]: string } = {};
let paddlePositions = {
  paddle1: 160,
  paddle2: 160,
};

export function setupSocket(io: any) {
  io.on('connection', (socket: any) => {
    console.log('A user connected:', socket.id);

    socket.on('register', (userId: string) => {
      users[userId] = socket.id;
      socket.userId = userId;
      console.log('User registered:', userId);

      // Emit current paddle positions to the newly connected user
      socket.emit('updatePaddlePositions', paddlePositions);
    });

    socket.on('signal', (data: any) => {
      const recipientSocketId = users[data.to];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('signal', data);
        console.log(`Forwarded signal to: ${data.to}`);
      } else {
        console.log(`Recipient not found for: ${data.to}`);
      }
    });

    socket.on('message', (data: any) => {
      const recipientSocketId = users[data.to];
      io.to(recipientSocketId).emit('message', data);
    });

    // Handle paddle movement
    socket.on('movePaddle', (data: any) => {
      let { paddle, position } = data;
      if (paddle != 'paddle1') {
        paddlePositions['paddle2'] = position;
      } else {
        paddlePositions['paddle1'] = position;
      }

      // Emit updated paddle positions to all clients
      io.emit('updatePaddlePositions', paddlePositions);
      console.log(`Updated ${paddle} position to: ${position}`);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.userId);
      delete users[socket.userId];
    });
  });
}
