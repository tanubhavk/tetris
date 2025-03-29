import React, { useState, useEffect } from "react";
import "./styles/styles.css";

window.addEventListener("keydown", function (e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault(); // Stop page scroll
  }
});


const ROWS = 20;
const COLS = 10;

const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOES[randomKey];
};

const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const App = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(randomTetromino());
  const [position, setPosition] = useState({
    row: 0,
    col: Math.floor(COLS / 2) - 1,
  });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);
  const [nextPiece, setNextPiece] = useState(randomTetromino());
  const [gameOver, setGameOver] = useState(false);

  const mergePiece = (newBoard, piece, pos) => {
    piece.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          newBoard[rowIndex + pos.row][colIndex + pos.col] = 1;
        }
      });
    });
  };

  const collision = (piece, pos) => {
    for (let row = 0; row < piece.length; row++) {
      for (let col = 0; col < piece[row].length; col++) {
        if (
          piece[row][col] === 1 &&
          (board[row + pos.row] === undefined ||
            board[row + pos.row][col + pos.col] === undefined ||
            board[row + pos.row][col + pos.col] !== 0)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const removeRows = (newBoard) => {
    let clearedRows = 0;
    newBoard = newBoard.filter((row) => {
      if (row.every((cell) => cell !== 0)) {
        clearedRows += 1;
        return false;
      }
      return true;
    });

    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(0));
    }

    if (clearedRows > 0) {
      setScore((prev) => prev + clearedRows * 100);
      setLinesCleared((prev) => prev + clearedRows);

      if (clearedRows >= 4) {
        setLevel((prev) => prev + 1);
      }
    }

    return newBoard;
  };

  const movePiece = (dir) => {
    const newPos = { row: position.row, col: position.col + dir };
    if (!collision(currentPiece, newPos)) {
      setPosition(newPos);
    }
  };

  const dropPiece = () => {
    const newPos = { row: position.row + 1, col: position.col };

    if (collision(currentPiece, newPos)) {
      const newBoard = [...board];
      mergePiece(newBoard, currentPiece, position);
      setBoard(removeRows(newBoard));

      const newPiece = nextPiece;
      const newNextPiece = randomTetromino();

      setCurrentPiece(newPiece);
      setNextPiece(newNextPiece);
      setPosition({ row: 0, col: Math.floor(COLS / 2) - 1 });

      if (collision(newPiece, { row: 0, col: Math.floor(COLS / 2) - 1 })) {
        setGameOver(true);
      }
    } else {
      setPosition(newPos);
    }
  };

  const rotatePiece = () => {
    const rotatedPiece = currentPiece[0].map((_, index) =>
      currentPiece.map((row) => row[index]).reverse()
    );
    if (!collision(rotatedPiece, position)) {
      setCurrentPiece(rotatedPiece);
    }
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(randomTetromino());
    setNextPiece(randomTetromino());
    setPosition({ row: 0, col: Math.floor(COLS / 2) - 1 });
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (!gameOver) {
      const interval = setInterval(dropPiece, 500 - level * 20);
      return () => clearInterval(interval);
    }
  }, [board, currentPiece, position, gameOver, level]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft") movePiece(-1);
      if (e.key === "ArrowRight") movePiece(1);
      if (e.key === "ArrowDown") dropPiece();
      if (e.key === "ArrowUp") rotatePiece();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPiece, position, gameOver]);

  const renderNextPiece = () => {
    const gridSize = 5;
    const emptyGrid = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(0)
    );

    const rowOffset = Math.floor((gridSize - nextPiece.length) / 2);
    const colOffset = Math.floor((gridSize - nextPiece[0].length) / 2);

    nextPiece.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 1) {
          emptyGrid[rowIndex + rowOffset][colIndex + colOffset] = 1;
        }
      });
    });

    return emptyGrid.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={`cell ${cell ? "filled" : ""}`}
          style={{ width: "20px", height: "20px" }}
        />
      ))
    );
  };

  return (
    <div className="game-container">
      {gameOver ? (
        <div className="game-over-overlay">
          <h1>GAME OVER</h1>
          <p>Your Score: {score}</p>
          <button onClick={resetGame}>Restart</button>
        </div>
      ) : (
        <>
          {/* Game Board */}
          <div className="board">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isFallingBlock = currentPiece.some((r, rIndex) =>
                  r.some(
                    (c, cIndex) =>
                      c === 1 &&
                      rowIndex === position.row + rIndex &&
                      colIndex === position.col + cIndex
                  )
                );

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${cell || isFallingBlock ? "filled" : ""}`}
                  />
                );
              })
            )}
          </div>

          {/* Side Panel */}
          <div className="side-panel">
            <div className="info-box">
              SCORE
              <br />
              {score}
            </div>
            <div className="info-box">
              LEVEL
              <br />
              {level}
            </div>
            <div className="info-box">
              LINES
              <br />
              {linesCleared}
            </div>
            <div className="next-piece">{renderNextPiece()}</div>
            <button onClick={resetGame}>RESET</button>
          </div>
        </>
      )}

      {/* Test Game Over Button */}
      {/* <button className="test-game-over-btn" onClick={() => setGameOver(true)}>
        Test Game Over
      </button> */}
    </div>
  );
};

export default App;
