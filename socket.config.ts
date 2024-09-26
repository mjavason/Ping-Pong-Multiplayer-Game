// Store ball state
let ballState = {
  ballX: 292.5,
  ballY: 192.5,
  ballSpeedX: 2,
  ballSpeedY: 2,
};

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

      // Emit the ball position to the newly connected user
      socket.emit('updateBallPosition', ballState);
    });

    // Start ball movement
    socket.on('startBall', () => {
      socket.emit('updateBallPosition', ballState); // Emit current ball position to all users
    });

    socket.on('broadcastBallPosition', (data: any) => {
      ballState = data; // Update ball state on the server
      socket.broadcast.emit('updateBallPosition', ballState); // Broadcast new ball position to other users
    });

    // Handle paddle movement
    socket.on('movePaddle', (data: any) => {
      let { paddle, position } = data;
      if (paddle !== 'paddle1') {
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
