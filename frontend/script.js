// script.js
const gameArea = document.getElementById('gameArea');
const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');

let paddle1Y = 160;
let paddle2Y = 160;
let ballX = 292.5;
let ballY = 192.5;
let ballSpeedX = 2;
let ballSpeedY = 2;
let speedIncrease = 0.1; // Speed increment after each paddle hit
let score1 = 0;
let score2 = 0;

// Make paddles draggable
let isDragging1 = false;
let isDragging2 = false;

// Paddle 1 drag events
paddle1.addEventListener('mousedown', () => (isDragging1 = true));
document.addEventListener('mouseup', () => (isDragging1 = false));
document.addEventListener('mousemove', (e) => {
  if (isDragging1) {
    let newY = e.clientY - gameArea.offsetTop - paddle1.offsetHeight / 2;
    if (newY < 0) newY = 0;
    if (newY > gameArea.clientHeight - paddle1.offsetHeight)
      newY = gameArea.clientHeight - paddle1.offsetHeight;
    paddle1Y = newY;
    paddle1.style.top = paddle1Y + 'px';
  }
});

// Paddle 2 drag events
paddle2.addEventListener('mousedown', () => (isDragging2 = true));
document.addEventListener('mouseup', () => (isDragging2 = false));
document.addEventListener('mousemove', (e) => {
  if (isDragging2) {
    let newY = e.clientY - gameArea.offsetTop - paddle2.offsetHeight / 2;
    if (newY < 0) newY = 0;
    if (newY > gameArea.clientHeight - paddle2.offsetHeight)
      newY = gameArea.clientHeight - paddle2.offsetHeight;
    paddle2Y = newY;
    paddle2.style.top = paddle2Y + 'px';
  }
});

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with top or bottom wall
  if (ballY <= 0 || ballY >= gameArea.clientHeight - ball.offsetHeight) {
    ballSpeedY = -ballSpeedY;
  }

  // Ball collision with paddles
  if (ballX <= paddle1.offsetLeft + paddle1.offsetWidth && ballY >= paddle1Y && ballY <= paddle1Y + paddle1.offsetHeight) {
    ballSpeedX = -(ballSpeedX + speedIncrease); // Increase speed and change direction
    ballSpeedY += (ballSpeedY > 0 ? speedIncrease : -speedIncrease); // Increase speed in Y direction
  }
  if (ballX >= paddle2.offsetLeft - ball.offsetWidth && ballY >= paddle2Y && ballY <= paddle2Y + paddle2.offsetHeight) {
    ballSpeedX = -(ballSpeedX - speedIncrease); // Increase speed and change direction
    ballSpeedY += (ballSpeedY > 0 ? speedIncrease : -speedIncrease); // Increase speed in Y direction
  }

  // Ball out of bounds (score)
  if (ballX <= 0) {
    score2++;
    resetBall();
  }
  if (ballX >= gameArea.clientWidth - ball.offsetWidth) {
    score1++;
    resetBall();
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

function gameLoop() {
  moveBall();
  requestAnimationFrame(gameLoop);
}

gameLoop();
