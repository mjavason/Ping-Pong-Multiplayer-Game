// ball.js

const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');

let ballX = 292.5;
let ballY = 192.5;
let ballSpeedX = 2;
let ballSpeedY = 2;
let gameOver = false;
let isBallInControl = false;
let playerTeam = 'paddle1'; // Default to paddle1

function initBallEvents(socket) {
  // Listen for ball updates from the server
  socket.on('updateBallPosition', (data) => {
    ballX = data.ballX;
    ballY = data.ballY;
    ballSpeedX = data.ballSpeedX;
    ballSpeedY = data.ballSpeedY;
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
  });

  // Listen for team assignment
  socket.on('teamAssignment', (data) => {
    console.log(data);
    playerTeam = data;
  });

  // Listen for score updates from the server
  socket.on('updateScore', (data) => {
    updateScore(data.score1, data.score2);
  });

  // Add this in your ball.js file, inside initBallEvents function
  socket.on('gameOver', (winner) => {
    displayGameOver(winner);
    // resetGame(); // Call a function to reset the game state if needed
  });

  requestAnimationFrame(moveBall);
}

function moveBall() {
  if (gameOver) return; // Exit if the game is over

  if (!isBallInControl) {
    isBallInControl = true; // Kickstart the ball movement
  }

  // Ball is in motion
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with left or right wall
  if (ballX <= 0 || ballX >= gameArea.clientWidth - ball.offsetWidth) {
    ballSpeedX = -ballSpeedX;
  }

  // Ball collision with paddles
  if (
    ballY <= paddle1.offsetTop + paddle1.offsetHeight &&
    ballX >= paddle1X &&
    ballX <= paddle1X + paddle1.offsetWidth
  ) {
    handlePaddleHit('paddle1', socket);
  }

  if (
    ballY >= paddle2.offsetTop - ball.offsetHeight &&
    ballX >= paddle2X &&
    ballX <= paddle2X + paddle2.offsetWidth
  ) {
    handlePaddleHit('paddle2', socket);
  }

  // Ball out of bounds (score)
  if (ballY <= 0 && playerTeam === 'paddle2') {
    // Player 2 missed, Player 1 should update the score
    socket.emit('score', { player: 'paddle1' });
    resetBall(socket);
  }
  if (
    ballY >= gameArea.clientHeight - ball.offsetHeight &&
    playerTeam === 'paddle1'
  ) {
    // Player 1 missed, Player 2 should update the score
    socket.emit('score', { player: 'paddle2' });
    resetBall(socket);
  }

  ball.style.left = ballX + 'px';
  ball.style.top = ballY + 'px';

  requestAnimationFrame(moveBall);
}

function handlePaddleHit(paddle, socket) {
  if (paddle === 'paddle1') {
    ballSpeedY = -ballSpeedY; // Change direction upwards
    ballY = paddle1.offsetTop + paddle1.offsetHeight; // Position the ball just above the paddle
  } else if (paddle === 'paddle2') {
    ballSpeedY = -ballSpeedY; // Change direction downwards
    ballY = paddle2.offsetTop - ball.offsetHeight; // Position the ball just below the paddle
  }

  const hitPosition =
    (ballX - (paddle === 'paddle1' ? paddle1X : paddle2X)) /
    paddle1.offsetWidth; // Hit position from 0 to 1
  ballSpeedX = (hitPosition - 0.5) * 4; // Adjust X speed based on hit position

  if (playerTeam === paddle) {
    // Only the player who hit the ball should broadcast the position
    socket.emit('broadcastBallPosition', {
      ballX,
      ballY,
      ballSpeedX,
      ballSpeedY,
    });
  }
}

function resetBall(socket) {
  ballX = gameArea.clientWidth / 2 - ball.offsetWidth / 2;
  ballY = gameArea.clientHeight / 2 - ball.offsetHeight / 2;
  ballSpeedX = 2 * (Math.random() > 0.5 ? 1 : -1); // Reset speed but randomize the direction
  ballSpeedY = 2 * (Math.random() > 0.5 ? 1 : -1); // Reset Y direction too

  socket.emit('broadcastBallPosition', {
    ballX,
    ballY,
    ballSpeedX,
    ballSpeedY,
  });
}

function updateScore(score1, score2) {
  scoreDisplay.textContent = `${score1} : ${score2}`;
}

function displayGameOver(winner) {
  scoreDisplay.style.display = 'none';
  ball.style.display = 'none';

  const gameOverMessage = document.createElement('div');
  gameOverMessage.textContent = `Game Over. Player ${
    winner === 1 ? 'Blue' : 'Red'
  } wins!`;
  gameOverMessage.style.position = 'absolute';
  gameOverMessage.style.top = '50%';
  gameOverMessage.style.left = '50%';
  gameOverMessage.style.transform = 'translate(-50%, -50%)';
  gameOverMessage.style.fontSize = '24px';
  gameOverMessage.style.color = 'red';
  gameArea.appendChild(gameOverMessage);
}

function resetGame() {
  // Reset any game state, if necessary
  score1 = 0;
  score2 = 0;
  updateScore(score1, score2); // Reset the score display
  gameOver = false; // Allow the game to start again
  ball.style.display = 'block'; // Show the ball again
  ball.style.left = ballX + 'px'; // Reset ball position if needed
  ball.style.top = ballY + 'px';
}

initBallEvents(socket);
