// app.js

// const socket = io('http://localhost:5000');
const socket = io('https://ping-pong-multiplayer-game-backend.onrender.com');

// Listen for the start of the ball movement
socket.on('startBall', () => {
  moveBall();
});

// Listen for the last player to join
socket.on('lastPlayerJoined', () => {
  resetBall();
  socket.emit('startBall');
});
