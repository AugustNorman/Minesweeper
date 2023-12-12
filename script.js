let gameWon = false;
let gameLost = false;
let board = [];
let outputBoard = [];
let timerInterval;
let seconds = 0;
let move = 0;
let gameCount = 0;
let flagCount = 0;
let mineCount = mines;


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
      //console.log('Rendering cell at:', i, j, 'with rows and columns:', rows, columns);
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

function showGameOverPopup() {
  setTimeout(function () {
  if (gameLost) {
    const playAgain = confirm("You lost! Do you want to play again?")
    if (playAgain) {
      resetGame()
    } else {
      return;
    }
  } else if (gameWon) {
    const playAgain = confirm("You won! Do you want to play again?")
    if (playAgain) {
      resetGame()
    } else {
      return;
    }
  }
  }, 1000);
}

function resetGame() {
  gameWon = false
  gameLost = false
  board = []
  outputBoard = []
  seconds = 0
  move = 0
  mineCount = mines
  flagCount = 0

  generateBoard(rows, columns, mines)
  userBoard(rows, columns)
  renderBoard()
  updateTimerDisplay()
  updateMineCountDisplay()
  gameCount++
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
    // If it is the first move, regenerate the board until the cell clicked is not a mine. We increment move at the start of the handleCellClicked function. To avoid an infinite loop, we stop after 50 generations
      var n = 0;
      while (board[row][col] !== 0) {
        if (n > 50) {
          break
        } else {
        board = []
        outputBoard = []
        generateBoard(rows, columns, mines)
        userBoard(rows, columns)
        n++
        }
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
        gameWon = true;
        showGameOverPopup()
      }
    } else if (board[row][col] === "mine") {
      gameLost = true;
      outputBoard = board
      console.clear();
      console.table(board);
      console.log("Mine! You lost :(");
      showGameOverPopup()
    } else if (xCount === mines) {
      console.clear();
      console.table(outputBoard);
      gameWon = true;
      showGameOverPopup()
    } else {
      console.clear();
      console.table(outputBoard);
    }
  } else {
    console.log("Error: Invalid click input");
    return;
  }

  renderBoard();
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
    console.clear()
    console.table(outputBoard)
    flagCount++
    updateMineCountDisplay()
  } else if (outputBoard[row][col] === "F") {
    outputBoard[row][col] = "X";
    console.clear()
    console.table(outputBoard)
    flagCount--
    updateMineCountDisplay()
  } else {
    console.log("Error: Square is already revealed");
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

function updateMineCountDisplay() {
  // Flag counting, it checks every square, and for each square with a flag we decrement the count of mines
  mineCount = (mines - flagCount)
  htmlMineCountDisplay()
}

function htmlMineCountDisplay() {
  // Update the display of the mine count on the HTML page
  const mineCountDisplay = document.getElementById('mine-count');
  const formattedMineCount = String(mineCount).padStart(2, '0');
  mineCountDisplay.textContent = formattedMineCount;
}

generateBoard(rows, columns, mines);
userBoard(rows, columns);
updateMineCountDisplay()
renderBoard();

// Add event listener for cell clicks
const container = document.getElementById('minesweeper-container');
container.addEventListener('contextmenu', function(event) {
  event.preventDefault();
  handleFlagPlacement(event);
});
container.addEventListener('click', handleCellClick);