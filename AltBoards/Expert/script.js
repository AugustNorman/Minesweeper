var gameWon = false;
var gameLost = false;
var board = [];
var outputBoard = [];
var sizeConditionChecker = false;
var timerInterval;
var seconds = 0;
var move = 0

function generateBoard(rows, cols, mines) {
  // Generate empty board
  for (let i = 0; i < rows; i++) {
    board.push(new Array(cols).fill(0));
  }

  // Randomly place mines
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    let row = Math.floor(Math.random() * rows);
    let col = Math.floor(Math.random() * cols);
    if (board[row][col] !== 'mine') {
      board[row][col] = 'mine';
      minesPlaced++;
    }
  }

  // Count neighboring mines
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j] !== 'mine') {
        let count = 0;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (i + x >= 0 && i + x < rows && j + y >= 0 && j + y < cols) {
              if (board[i + x][j + y] === 'mine') {
                count++;
              }
            }
          }
        }
        board[i][j] = count;
      }
    }
  }
  return board;
}

function userBoard(rows, cols) {
  // Makes the board the user sees
  for (let i = 0; i < rows; i++) {
    outputBoard.push(new Array(cols).fill("X"));
  }
  console.table(outputBoard);
  return outputBoard;
}

// Flood fill logic
function floodFill(x, y, rows, columns) {
  if (x < 0 || x >= columns || y < 0 || y >= rows || board[y][x] == "mine" || outputBoard[y][x] !== "X") {
    return;
  }
  outputBoard[y][x] = board[y][x];
  if (board[y][x] === 0) {
    floodFill(x, y - 1, rows, columns);
    floodFill(x, y + 1, rows, columns);
    floodFill(x + 1, y, rows, columns);
    floodFill(x - 1, y, rows, columns);
    floodFill(x - 1, y - 1, rows, columns);
    floodFill(x - 1, y + 1, rows, columns);
    floodFill(x + 1, y - 1, rows, columns);
    floodFill(x + 1, y + 1, rows, columns);
  }
}

function renderBoard() {
  const container = document.getElementById('minesweeper-container');
  container.innerHTML = '';

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.col = j;

      if (outputBoard[i][j] !== 'X') {
        cell.textContent = outputBoard[i][j];
        cell.classList.add(`number-${outputBoard[i][j]}`);
      }

      if (outputBoard[i][j] === 'F') {
        cell.classList.add('flag');
      }

      if (board[i][j] === 'mine' && gameLost) {
        cell.classList.add('mine');
      }

      cell.addEventListener('click', handleCellClick);
      container.appendChild(cell);
    }
  }
}

function handleFlagPlacement(event) {
  if (gameWon || gameLost) {
    return; // Stop further input if the game is won or lost
  }
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (isNaN(row) || isNaN(col)) {
    console.log("Error: Invalid input");
    return;
  }

  if (outputBoard[row][col] === "X") {
    outputBoard[row][col] = "F";
  } else if (outputBoard[row][col] === "F") {
    outputBoard[row][col] = "X";
  } else {
    console.log("Error: Square is already revealed");
    return;
  }

  renderBoard();
}

function handleCellClick(event) {
  if (gameWon || gameLost) {
    return; // Stop further input if the game is won or lost
  }
  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (isNaN(row) || isNaN(col)) {
    console.log("Error: Invalid input");
    return;
  }

  if (event.button === 0) {
    move++
    if (outputBoard[row][col] === "F") {
      console.log("Square is flagged and cannot be guessed");
      return;
    }

    if (move === 1) {
      // If it is the first move, regenerate the board until the cell clicked is not a mine. We increment move at the start of the function
      while (board[row][col] !== 0) {
        board = []
        outputBoard = []
        generateBoard(rows, columns, mines)
        userBoard(rows, columns)
      }
      startTimer()
    }
    outputBoard[row][col] = board[row][col];

    let xCount = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        if (outputBoard[i][j] === "X" || outputBoard[i][j] === "F") {
          xCount++;
        }
      }
    }

    if (board[row][col] === 0) {
      firstClick = true
      floodFill(col, row - 1, rows, columns);
      floodFill(col, row + 1, rows, columns);
      floodFill(col + 1, row, rows, columns);
      floodFill(col - 1, row, rows, columns);
      floodFill(col - 1, row - 1, rows, columns);
      floodFill(col - 1, row + 1, rows, columns);
      floodFill(col + 1, row - 1, rows, columns);
      floodFill(col + 1, row + 1, rows, columns);
      console.clear();
      console.table(outputBoard);
      if (xCount === mines) {
        console.clear();
        console.table(outputBoard);
        alert("You won! Congratulations");
        gameWon = true;
      }
    } else if (board[row][col] === "mine") {
      gameLost = true;
      outputBoard = board
      console.clear();
      console.table(board);
      console.log("Mine! You lost :(");
    } else if (xCount === mines) {
      console.clear();
      console.table(outputBoard);
      alert("You won! Congratulations");
      gameWon = true;
    } else {
      console.clear();
      console.table(outputBoard);
    }
  } else if (event.button === 2) {
    if (outputBoard[row][col] === "F") {
      outputBoard[row][col] = "X";
    } else if (outputBoard[row][col] === "X") {
      outputBoard[row][col] = "F";
      console.clear();
      console.table(outputBoard);
    } else {
      console.log("Error: Square is already revealed");
      return;
    }
  } else {
    console.log("Error: Invalid click input");
    return;
  }

  renderBoard();
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerDisplay() {
  // Update the display of the timer on the HTML page
  const timerDisplay = document.getElementById('timer');
  const formattedSeconds = String(seconds).padStart(3, '0');
  timerDisplay.textContent = formattedSeconds;
}

function startTimer() {
  timerInterval = setInterval(function() {
    if (!gameWon && !gameLost && move !== 0) {
    seconds++;
    updateTimerDisplay();
    } else if (gameWon || gameLost) { 
    stopTimer()
    } else {
      return;
    }
 }, 1000);
}

// Set the board size
var rows = 20;
var columns = 24;
var mines = 99;

generateBoard(rows, columns, mines);
userBoard(rows, columns);
renderBoard();

// Add event listener for cell clicks
const container = document.getElementById('minesweeper-container');
container.addEventListener('contextmenu', function(event) {
  event.preventDefault();
  handleFlagPlacement(event);
});
container.addEventListener('click', handleCellClick);