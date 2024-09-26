// paddle.js

let paddle1X = 160;
let paddle2X = 160;
const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const gameArea = document.getElementById('gameArea');

function initPaddleEvents(socket) {
  let isDragging1 = false;
  let isDragging2 = false;

  // Paddle 1 drag events (Mouse)
  paddle1.addEventListener('mousedown', () => (isDragging1 = true));
  document.addEventListener('mouseup', () => (isDragging1 = false));
  document.addEventListener('mousemove', (e) => {
    if (isDragging1) {
      handleDrag(e.clientX, 'paddle1', socket);
    }
  });

  // Paddle 1 drag events (Touch)
  paddle1.addEventListener('touchstart', () => (isDragging1 = true));
  document.addEventListener('touchend', () => (isDragging1 = false));
  document.addEventListener('touchmove', (e) => {
    if (isDragging1) {
      const touch = e.touches[0];
      handleDrag(touch.clientX, 'paddle1', socket);
    }
  });

  // Paddle 2 drag events (Mouse)
  paddle2.addEventListener('mousedown', () => (isDragging2 = true));
  document.addEventListener('mouseup', () => (isDragging2 = false));
  document.addEventListener('mousemove', (e) => {
    if (isDragging2) {
      handleDrag(e.clientX, 'paddle2', socket);
    }
  });

  // Paddle 2 drag events (Touch)
  paddle2.addEventListener('touchstart', () => (isDragging2 = true));
  document.addEventListener('touchend', () => (isDragging2 = false));
  document.addEventListener('touchmove', (e) => {
    if (isDragging2) {
      const touch = e.touches[0];
      handleDrag(touch.clientX, 'paddle2', socket);
    }
  });
}

function handleDrag(x, paddle, socket) {
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

initPaddleEvents(socket);