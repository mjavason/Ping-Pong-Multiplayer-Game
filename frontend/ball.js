const ball = document.getElementById('ball');
const scoreDisplay = document.getElementById('score');

let ballX = 292.5;
let ballY = 192.5;
let ballSpeedX = 2;
let ballSpeedY = 2;
let score1 = 0;
let score2 = 0;
let gameOver = false;
let isBallInControl = false;
let playerTeam = 'paddle1';

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
    // Disable the paddle movement for the other team
    disablePaddleMovement(playerTeam);
  });

  requestAnimationFrame(moveBall);
}

function disablePaddleMovement(team) {
  const otherTeam = team === 'paddle1' ? 'paddle2' : 'paddle1';
  const otherPaddle = document.getElementById(otherTeam);

  // Disable dragging for the other paddle
  otherPaddle.setAttribute('draggable', 'false'); // Make paddle undraggable
  otherPaddle.style.pointerEvents = 'none'; // Disable pointer events on the other paddle
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
  if (ballY <= 0) {
    socket.emit('score', { player: 'paddle2' }); // Notify the server about the score
    resetBall();
  }
  if (ballY >= gameArea.clientHeight - ball.offsetHeight) {
    socket.emit('score', { player: 'paddle1' }); // Notify the server about the score
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

  if (playerTeam == paddle) {
    console.log('Broadcast Ball Position');
    // Broadcast the new ball position
    socket.emit('broadcastBallPosition', {
      ballX,
      ballY,
      ballSpeedX,
      ballSpeedY,
    });
  }
}

function resetBall() {
  ballX = gameArea.clientWidth / 2 - ball.offsetWidth / 2;
  ballY = gameArea.clientHeight / 2 - ball.offsetHeight / 2;
  ballSpeedX = 2 * (Math.random() > 0.5 ? 1 : -1); // Reset speed but randomize the direction
  ballSpeedY = 2 * (Math.random() > 0.5 ? 1 : -1); // Reset Y direction too

  console.log('Ball reset');

  socket.emit('broadcastBallPosition', {
    ballX,
    ballY,
    ballSpeedX,
    ballSpeedY,
  });
}

function updateScore() {
  scoreDisplay.textContent = `${score1} : ${score2}`;
}

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

initBallEvents(socket);
