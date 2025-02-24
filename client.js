// client.js
import { io } from 'socket.io-client';

// Connect to the Socket.IO server running on port 3000
const socket = io('http://localhost:3000');

// Get references to DOM elements (assumes these exist because index.html loads this script at the end)
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearButton');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Drawing defaults
let currentColor = '#000000';
let brushSize = 5;
let isDrawing = false;

// Listen for the full board state from the server and draw it
socket.on('boardState', (boardState) => {
  boardState.forEach((data) => drawOnCanvas(data));
});

// Listen for individual draw events
socket.on('draw', (data) => {
  drawOnCanvas(data);
});

// Listen for clear board events
socket.on('clearBoard', () => {
  clearCanvas();
});

// Draw on the canvas (here, we draw a small circle for each draw action)
function drawOnCanvas(data) {
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.arc(data.x, data.y, brushSize, 0, 2 * Math.PI);
  ctx.fill();
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Event listeners for drawing
canvas.addEventListener('mousedown', () => {
  isDrawing = true;
});
canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  // Instead of drawing immediately, emit the draw event to the server
  socket.emit('draw', { x, y, color: currentColor });
});

// Clear board button listener
clearButton.addEventListener('click', () => {
  socket.emit('clearBoard');
});
