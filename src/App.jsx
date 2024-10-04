import React, { useEffect, useRef, useState } from "react";
import './styles/global.css'
import './screen.css'

const BrickBreaker = () => {
  const defaultState = {
    paddleX: 200, // Posição inicial do paddle
    ballX: 240, // Posição inicial da bola em X
    ballY: 300, // Posição inicial da bola em Y
    ballDX: 1, // Direção e velocidade da bola em X
    ballDY: -2, // Direção e velocidade da bola em Y
    bricks: [], // Array de tijolos
    isRunning: true, // Se o jogo está ativo
    score: 0, // Pontuação inicial
  }

  const canvasRef = useRef(null); // Referência para o canvas
  const [gameState, setGameState] = useState(defaultState);

  // Inicializar os tijolos
  useEffect(() => {
    const brickRows = 5;
    const brickCols = 9;
    let bricksArray = [];

    for (let r = 0; r < brickRows; r++) {
      bricksArray[r] = [];
      for (let c = 0; c < brickCols; c++) {
        bricksArray[r][c] = { x: 0, y: 0, status: 1 }; // status 1 = visível
      }
    }

    setGameState((prev) => ({ ...prev, bricks: bricksArray }));
  }, []);

  // Atualizar o jogo em cada frame
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const paddleHeight = 10;
    const paddleWidth = 100;
    const ballRadius = 10;

    // Função para desenhar os tijolos
    const drawBricks = () => {
      const { bricks } = gameState;
      bricks.forEach((row, r) => {
        row.forEach((brick, c) => {
          if (brick.status === 1) {
            const brickX = c * 52;
            const brickY = r * 22;
            bricks[r][c].x = brickX;
            bricks[r][c].y = brickY;
            ctx.fillStyle = "#000";
            ctx.shadowColor = "#ff1010"
            ctx.shadowBlur = 8;
            ctx.fillRect(brickX, brickY, 48, 18);
          }
        });
      });
    };

    // Desenhar o paddle
    const drawPaddle = () => {
      ctx.fillStyle = "#FFF"; //#0095DD
      ctx.fillRect(
        gameState.paddleX,
        canvas.height - paddleHeight,
        paddleWidth,
        paddleHeight
      );
    };

    // Desenhar a bola
    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(gameState.ballX, gameState.ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#FFF";
      ctx.fill();
      ctx.closePath();
    };

    // Atualizar o estado do jogo e desenhar os elementos
    const draw = () => {
      if (!gameState.isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpar o canvas
      drawBricks();
      drawBall();
      drawPaddle();
      moveBall();
      handleCollision();
    };

    // Mover a bola
    const moveBall = () => {
      setGameState((prev) => ({
        ...prev,
        ballX: prev.ballX + prev.ballDX,
        ballY: prev.ballY + prev.ballDY,
      }));
    };

    // Verificar colisões com tijolos, paredes e paddle
    const handleCollision = () => {
      const { ballX, ballY, ballDX, ballDY, paddleX, bricks, score } =
        gameState;
      const ballRadius = 10;

      // Colisão com as laterais
      if (
        ballX + ballDX > canvas.width - ballRadius ||
        ballX + ballDX < ballRadius
      ) {
        setGameState((prev) => ({ ...prev, ballDX: -ballDX}));
      }
      // Colisão com o topo
      if (ballY + ballDY < ballRadius) {
        setGameState((prev) => ({ ...prev, ballDY: -ballDY }));
      } else if (ballY + ballDY > canvas.height - ballRadius) {
        // Colisão com o paddle
        if (ballX > paddleX && ballX < paddleX + 100) {
          setGameState((prev) => ({ ...prev, ballDY: -ballDY }));
        } else {
          // Se a bola passar do paddle, fim de jogo
          setGameState((prev) => ({ ...prev, isRunning: false }));
        }
      }

      // Colisão com tijolos
      bricks.forEach((row, r) => {
        row.forEach((brick, c) => {
          if (brick.status === 1) {
            const brickX = brick.x;
            const brickY = brick.y;
            
            if (
              ballX > brickX &&
              ballX < brickX + 50 &&
              ballY > brickY &&
              ballY < brickY + 20
            ) {
              setGameState((prev) => ({
                ...prev,
                ballDY: -ballDY,
                // ballDX: -ballDX + 1,
                bricks: bricks.map((row, i) =>
                  row.map((b, j) =>
                    i === r && j === c ? { ...b, status: 0 } : b
                  )
                ),
                score: score + 1, // Aumenta a pontuação ao quebrar um tijolo
                // ballDX: ballDX + 1,
                // setGameState((prev) => ({ ...prev, ballDX: ballDX + 0.25 })); // Aumenta a velocidade da bola no eixo X
                
              }));
            }
          }
        });
      });
    };

    // Loop de animação
    const interval = setInterval(draw, 10);

    return () => {
      clearInterval(interval);
    };
  }, [gameState]);

  // Mover o paddle com o teclado
  const handleKeyDown = (e) => {
    const key = e.key;
    if (key === "ArrowRight") {
      setGameState((prev) => ({
        ...prev,
        paddleX: Math.min(prev.paddleX + 50, canvasRef.current.width - 100),
      }));
    } else if (key === "ArrowLeft") {
      setGameState((prev) => ({
        ...prev,
        paddleX: Math.max(prev.paddleX - 50, 0),
      }));
    }
  };

  return (
    <>
      <div className="container">
        <div className="screen">
          <div className="game" onKeyDown={handleKeyDown} tabIndex="0" style={{ outline: "none" }}>
            <canvas ref={canvasRef} width={480} height={320} />
            <h2>Score: {gameState.score}</h2>
          </div>
        </div>
      </div>
      {!gameState.isRunning &&
        <div className="gameOver">
          <div className="gameOverInfo">
            <h2>💀</h2>
            <h2>Game Over</h2>
            <h2>Zé/Maria Bosta</h2>
            <h2>Score: {gameState.score}</h2>
            <button onClick={() => {location.reload()}}>Jogar novamente</button>
          </div>
        </div>
      }
    </>
  );
};

export default BrickBreaker;
