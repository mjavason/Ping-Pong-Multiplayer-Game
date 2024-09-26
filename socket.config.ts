import { Server, Socket } from 'socket.io';

let players: { id: string; team: 'paddle1' | 'paddle2' | null }[] = [];
let ballState = {
  ballX: 292.5,
  ballY: 192.5,
  ballSpeedX: 2,
  ballSpeedY: 2,
};
let paddlePositions = { paddle1: 160, paddle2: 160 }; // Track paddle positions
let lastHitTeam: 'paddle1' | 'paddle2' | null = null;

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Assign player to a team (side1 or side2)
    let playerTeam: 'paddle1' | 'paddle2' | null = null;
    if (players.length === 0) {
      playerTeam = 'paddle1';
    } else if (players.length === 1) {
      playerTeam = 'paddle2';
    }

    players.push({ id: socket.id, team: playerTeam });
    console.log(`Assigned player ${socket.id} to team ${playerTeam}`);

    // Emit the team assignment to the player
    socket.emit('teamAssignment', playerTeam);

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
      players = players.filter((player) => player.id !== socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
