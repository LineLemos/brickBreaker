import { useEffect, useRef, useState } from "react";
import './styles/global.css'
import './screen.css'

const BrickBreaker = () => {
  const canvasRef = useRef(null);

  const [paddleX, setPaddleX] = useState(200); // Posição inicial do paddle
  const [ballX, setBallX] = useState(240); // Posição inicial da bola em X
  const [ballY, setBallY] = useState(300); // Posição inicial da bola em Y
  const [ballDX, setBallDX] = useState(1); // Direção e velocidade da bola em X
  const [ballDY, setBallDY] = useState(-2); // Direção e velocidade da bola em Y
  const [bricks, setBricks] = useState([]); // Array de tijolos
  const [isRunning, setIsRunning] = useState(true); // Se o jogo está ativo
  const [score, setScore] = useState(0); // Pontuação inicial

  // Inicializar os tijolos
  useEffect(() => {
    const brickRows = 5
    const brickCols = 9
    let bricksArray = []

    for (let r = 0; r < brickRows; r++) {
      bricksArray[r] = []
      for (let c = 0; c < brickCols; c++) {
        bricksArray[r][c] = { x: 0, y: 0, status: 1 } // status 1 = visível
      }
    }

    setBricks(bricksArray);
  }, []);

  // Atualizar o jogo em cada frame
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const paddleHeight = 10
    const paddleWidth = 100
    const ballRadius = 10
    console.log(canvasRef)

    // Função para desenhar os tijolos
    const drawBricks = () => {
      bricks.forEach((row, r) => {
        row.forEach((brick, c) => {
          if (brick.status === 1) {
            const brickX = c * 52
            const brickY = r * 22
            bricks[r][c].x = brickX
            bricks[r][c].y = brickY
            ctx.fillStyle = "#000"
            ctx.shadowColor = "#ff1010"
            ctx.shadowBlur = 8
            ctx.fillRect(brickX, brickY, 48, 18)
          }
        })
      })
    };

    // Desenhar o paddle
    const drawPaddle = () => {
      ctx.fillStyle = "#FFF" //#0095DD
      ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight)
    };

    // Desenhar a bola
    const drawBall = () => {
      ctx.beginPath()
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#FFF"
      ctx.fill()
      ctx.closePath()
    };

    // Atualizar o estado do jogo e desenhar os elementos
    const draw = () => {
      if (!isRunning) return

      ctx.clearRect(0, 0, canvas.width, canvas.height) // Limpar o canvas
      drawBricks()
      drawBall()
      drawPaddle()
      moveBall()
      handleCollision()
    };

    // Mover a bola
    const moveBall = () => {
      setBallX(prevBallX => prevBallX + ballDX)
      setBallY(prevBallY => prevBallY + ballDY)
    };

    // Verificar colisões com tijolos, paredes e paddle
    const handleCollision = () => {
      // Colisão com as laterais
      if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        setBallDX(-ballDX)
      }

      // Colisão com o topo
      if (ballY + ballDY < ballRadius) {
        setBallDY(-ballDY)
      } else if (ballY + ballDY > canvas.height - ballRadius) {
        // Colisão com o paddle
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
          const hitPoint = ballX - (paddleX + paddleWidth / 2)
          const normalizedHitPoint = hitPoint / (paddleWidth / 2)
          setBallDY(-ballDY) // Inverter a direção vertical
          setBallDX(normalizedHitPoint * 2) // Ajusta a direção horizontal
        } else {
          // Se a bola passar do paddle, fim de jogo
          setIsRunning(false)
        }
      }

      // Colisão com tijolos
      bricks.forEach((row, r) => {
        row.forEach((brick, c) => {
          if (brick.status === 1) {
            const brickX = brick.x
            const brickY = brick.y
            if (
              ballX > brickX &&
              ballX < brickX + 50 &&
              ballY > brickY &&
              ballY < brickY + 20
            ) {
              setBallDY(-ballDY)
              const updatedBricks = bricks.map((row, i) =>
                row.map((b, j) => (i === r && j === c ? { ...b, status: 0 } : b))
              )
              setBricks(updatedBricks)
              setScore(score + 1)
            }
          }
        })
      })
    };

    // Loop de animação
    const interval = setInterval(draw, 10)

    return () => {
      clearInterval(interval)
    };
  }, [ballX, ballY, ballDX, ballDY, bricks, isRunning, paddleX])

  // Mover o paddle com o teclado
  const handleKeyDown = (e) => {
    const key = e.key
    if (key === "ArrowRight") {
      setPaddleX(prevPaddleX => Math.min(prevPaddleX + 50, canvasRef.current.width - 100))
    } else if (key === "ArrowLeft") {
      setPaddleX(prevPaddleX => Math.max(prevPaddleX - 50, 0))
    }
  };

  return (
    <>
      <div className="container">
        <div className="screen">
          <div className="game" onKeyDown={handleKeyDown} tabIndex="0" style={{ outline: "none" }}>
            <canvas ref={canvasRef} width={480} height={320} />
            <h2>Score: {score}</h2>
          </div>
        </div>
      </div>
      {!isRunning &&
        <div className="gameOver">
          <div className="gameOverInfo">
            <h2>💀</h2>
            <h2>Game Over</h2>
            <h2>Zé/Maria Bosta</h2>
            <h2>Score: {score}</h2>
            <button onClick={() => {location.reload()}}>Jogar novamente</button>
          </div>
        </div>
      }
    </>
  );
};

export default BrickBreaker;
