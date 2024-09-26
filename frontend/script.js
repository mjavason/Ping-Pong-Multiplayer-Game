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
let score1 = 0;
let score2 = 0;

// Control paddles using the keyboard
document.addEventListener('keydown', (e) => {
  const paddleSpeed = 20;
  if (e.key === 'w' && paddle1Y > 0) {
    paddle1Y -= paddleSpeed;
  }
  if (e.key === 's' && paddle1Y < gameArea.clientHeight - paddle1.offsetHeight) {
    paddle1Y += paddleSpeed;
  }
  if (e.key === 'ArrowUp' && paddle2Y > 0) {
    paddle2Y -= paddleSpeed;
  }
  if (e.key === 'ArrowDown' && paddle2Y < gameArea.clientHeight - paddle2.offsetHeight) {
    paddle2Y += paddleSpeed;
  }
  updatePaddles();
});

function updatePaddles() {
  paddle1.style.top = paddle1Y + 'px';
  paddle2.style.top = paddle2Y + 'px';
}

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with top or bottom wall
  if (ballY <= 0 || ballY >= gameArea.clientHeight - ball.offsetHeight) {
    ballSpeedY = -ballSpeedY;
  }

  // Ball collision with paddles
  if (ballX <= paddle1.offsetLeft + paddle1.offsetWidth && ballY >= paddle1Y && ballY <= paddle1Y + paddle1.offsetHeight) {
    ballSpeedX = -ballSpeedX;
  }
  if (ballX >= paddle2.offsetLeft - ball.offsetWidth && ballY >= paddle2Y && ballY <= paddle2Y + paddle2.offsetHeight) {
    ballSpeedX = -ballSpeedX;
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
  ballSpeedX = -ballSpeedX;
}

function updateScore() {
  scoreDisplay.textContent = `${score1} : ${score2}`;
}

function gameLoop() {
  moveBall();
  requestAnimationFrame(gameLoop);
}

gameLoop();
