// script.js

const gameArea = document.getElementById('gameArea');
const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');

let paddle1X = 160;
let paddle2X = 160;
let ballX = 292.5;
let ballY = 192.5;
let ballSpeedX = 2;
let ballSpeedY = 2;
let speedIncrease = 1.1; // Increase speed by 10% on each hit
let score1 = 0;
let score2 = 0;
let gameOver = false; // Variable to track if the game is over

// Make paddles draggable (both mouse and touch)
let isDragging1 = false;
let isDragging2 = false;

// Connect to the Socket.IO server
const socket = io('http://localhost:5000');

// Listen for updated paddle positions from the server
socket.on('updatePaddlePositions', (positions) => {
  paddle1X = positions.paddle1;
  paddle2X = positions.paddle2;
  paddle1.style.left = paddle1X + 'px';
  paddle2.style.left = paddle2X + 'px';
});

// Paddle 1 drag events (Mouse)
paddle1.addEventListener('mousedown', () => (isDragging1 = true));
document.addEventListener('mouseup', () => (isDragging1 = false));
document.addEventListener('mousemove', (e) => {
  if (isDragging1) {
    handleDrag(e.clientX, 'paddle1');
  }
});

// Paddle 1 drag events (Touch)
paddle1.addEventListener('touchstart', () => (isDragging1 = true));
document.addEventListener('touchend', () => (isDragging1 = false));
document.addEventListener('touchmove', (e) => {
  if (isDragging1) {
    const touch = e.touches[0];
    handleDrag(touch.clientX, 'paddle1');
  }
});

// Paddle 2 drag events (Mouse)
paddle2.addEventListener('mousedown', () => (isDragging2 = true));
document.addEventListener('mouseup', () => (isDragging2 = false));
document.addEventListener('mousemove', (e) => {
  if (isDragging2) {
    handleDrag(e.clientX, 'paddle2');
  }
});

// Paddle 2 drag events (Touch)
paddle2.addEventListener('touchstart', () => (isDragging2 = true));
document.addEventListener('touchend', () => (isDragging2 = false));
document.addEventListener('touchmove', (e) => {
  if (isDragging2) {
    const touch = e.touches[0];
    handleDrag(touch.clientX, 'paddle2');
  }
});

// Function to handle paddle dragging
function handleDrag(x, paddle) {
  const paddleElement = document.getElementById(paddle);
  let newX = x - gameArea.offsetLeft - paddleElement.offsetWidth / 2;

  // Constrain the paddles within the game area
  if (newX < 0) newX = 0;
  if (newX > gameArea.clientWidth - paddleElement.offsetWidth) {
    newX = gameArea.clientWidth - paddleElement.offsetWidth;
  }

  if (paddle === 'paddle1') {
    paddle1X = newX;
    paddle1.style.left = paddle1X + 'px';
    socket.emit('movePaddle', { paddle: 'paddle1', position: paddle1X });
  } else if (paddle === 'paddle2') {
    paddle2X = newX;
    paddle2.style.left = paddle2X + 'px';
    socket.emit('movePaddle', { paddle: 'paddle2', position: paddle2X });
  }
}

function moveBall() {
  if (gameOver) return; // Exit if the game is over

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
    ballSpeedY = -ballSpeedY; // Change direction upwards
    ballY = paddle1.offsetTop + paddle1.offsetHeight; // Position the ball just above the paddle
    // Adjust the X speed based on where the ball hits the paddle
    const hitPosition = (ballX - paddle1X) / paddle1.offsetWidth; // Hit position from 0 to 1
    ballSpeedX = (hitPosition - 0.5) * speedIncrease * 4; // Adjust X speed based on hit position

    // Increase speed
    ballSpeedX *= speedIncrease; // Increase the speed after hitting the paddle
    ballSpeedY *= speedIncrease; // Increase the Y speed as well
  }

  if (
    ballY >= paddle2.offsetTop - ball.offsetHeight &&
    ballX >= paddle2X &&
    ballX <= paddle2X + paddle2.offsetWidth
  ) {
    ballSpeedY = -ballSpeedY; // Change direction downwards
    ballY = paddle2.offsetTop - ball.offsetHeight; // Position the ball just below the paddle
    // Adjust the X speed based on where the ball hits the paddle
    const hitPosition = (ballX - paddle2X) / paddle2.offsetWidth; // Hit position from 0 to 1
    ballSpeedX = (hitPosition - 0.5) * speedIncrease * 4; // Adjust X speed based on hit position

    // Increase speed
    ballSpeedX *= speedIncrease; // Increase the speed after hitting the paddle
    ballSpeedY *= speedIncrease; // Increase the Y speed as well
  }

  // Ball out of bounds (score)
  if (ballY <= 0) {
    score2++;
    resetBall();
  }
  if (ballY >= gameArea.clientHeight - ball.offsetHeight) {
    score1++;
    resetBall();
  }

  // Check for game over condition
  if (score1 === 10 || score2 === 10) {
    gameOver = true;
    displayGameOver();
  }

  ball.style.left = ballX + 'px';
  ball.style.top = ballY + 'px';
  updateScore();
}

function resetBall() {
  ballX = gameArea.clientWidth / 2 - ball.offsetWidth / 2;
  ballY = gameArea.clientHeight / 2 - ball.offsetHeight / 2;
  ballSpeedX = 2 * (Math.random() > 0.5 ? 1 : -1); // Reset speed but randomize the direction
  ballSpeedY = 2 * (Math.random() > 0.5 ? 1 : -1); // Reset Y direction too
}

function updateScore() {
  scoreDisplay.textContent = `${score1} : ${score2}`;
}

// Display game over message
function displayGameOver() {
  scoreDisplay.style.display = 'none';
  ball.style.display = 'none';

  const gameOverMessage = document.createElement('div');
  gameOverMessage.textContent = `Game Over. Player ${
    score1 === 10 ? 1 : 2
  } wins!`;
  gameOverMessage.style.position = 'absolute';
  gameOverMessage.style.top = '50%';
  gameOverMessage.style.left = '50%';
  gameOverMessage.style.transform = 'translate(-50%, -50%)';
  gameOverMessage.style.fontSize = '24px';
  gameOverMessage.style.color = 'red';
  gameArea.appendChild(gameOverMessage);
}

// Start the game loop
function gameLoop() {
  moveBall();
  requestAnimationFrame(gameLoop);
}

gameLoop(); // Start the game loop
