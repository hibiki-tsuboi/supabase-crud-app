'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'

type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
type Board = Cell[][]
type Position = { x: number; y: number }

interface Piece {
  shape: number[][]
  color: Cell
  position: Position
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const EMPTY_CELL: Cell = 0

const PIECES = [
  // I piece
  { shape: [[1, 1, 1, 1]], color: 1 as Cell },
  // O piece  
  { shape: [[2, 2], [2, 2]], color: 2 as Cell },
  // T piece
  { shape: [[0, 3, 0], [3, 3, 3]], color: 3 as Cell },
  // S piece
  { shape: [[0, 4, 4], [4, 4, 0]], color: 4 as Cell },
  // Z piece
  { shape: [[5, 5, 0], [0, 5, 5]], color: 5 as Cell },
  // J piece
  { shape: [[6, 0, 0], [6, 6, 6]], color: 6 as Cell },
  // L piece
  { shape: [[0, 0, 7], [7, 7, 7]], color: 7 as Cell }
]

const COLORS = [
  '#000000', // Empty
  '#00FFFF', // I - Cyan
  '#FFFF00', // O - Yellow
  '#800080', // T - Purple
  '#00FF00', // S - Green
  '#FF0000', // Z - Red
  '#0000FF', // J - Blue
  '#FFA500'  // L - Orange
]

export default function TetrisPage() {
  const router = useRouter()
  const [board, setBoard] = useState<Board>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const createEmptyBoard = (): Board => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL))

  const generatePiece = (): Piece => {
    const pieceTemplate = PIECES[Math.floor(Math.random() * PIECES.length)]
    return {
      shape: pieceTemplate.shape.map(row => row.map(cell => cell ? pieceTemplate.color : 0)),
      color: pieceTemplate.color,
      position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceTemplate.shape[0].length / 2), y: 0 }
    }
  }

  const isValidPosition = (piece: Piece, board: Board, dx = 0, dy = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = piece.position.x + x + dx
          const newY = piece.position.y + y + dy
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }
          
          if (newY >= 0 && board[newY][newX] !== EMPTY_CELL) {
            return false
          }
        }
      }
    }
    return true
  }

  const mergePieceToBoard = (piece: Piece, board: Board): Board => {
    const newBoard = board.map(row => [...row])
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const boardY = piece.position.y + y
          const boardX = piece.position.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color
          }
        }
      }
    }
    
    return newBoard
  }

  const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => cell === EMPTY_CELL))
    const linesCleared = BOARD_HEIGHT - newBoard.length
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL))
    }
    
    return { newBoard, linesCleared }
  }

  const rotatePiece = (piece: Piece): Piece => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    )
    
    return {
      ...piece,
      shape: rotated
    }
  }

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || !isPlaying || isGameOver) return

    if (isValidPosition(currentPiece, board, dx, dy)) {
      setCurrentPiece(prev => prev ? {
        ...prev,
        position: { x: prev.position.x + dx, y: prev.position.y + dy }
      } : null)
    } else if (dy > 0) {
      // Piece can't move down, lock it
      const newBoard = mergePieceToBoard(currentPiece, board)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
      
      setBoard(clearedBoard)
      setLines(prev => prev + linesCleared)
      setScore(prev => prev + linesCleared * 100 * level)
      
      // Check for game over
      if (nextPiece && !isValidPosition(nextPiece, clearedBoard)) {
        setIsGameOver(true)
        setIsPlaying(false)
        return
      }
      
      setCurrentPiece(nextPiece)
      setNextPiece(generatePiece())
    }
  }, [currentPiece, board, isPlaying, isGameOver, nextPiece, level])

  const handleRotate = useCallback(() => {
    if (!currentPiece || !isPlaying || isGameOver) return

    const rotatedPiece = rotatePiece(currentPiece)
    if (isValidPosition(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece)
    }
  }, [currentPiece, board, isPlaying, isGameOver])

  const startGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPiece(generatePiece())
    setNextPiece(generatePiece())
    setScore(0)
    setLines(0)
    setLevel(1)
    setIsGameOver(false)
    setIsPlaying(true)
  }

  const togglePause = () => {
    if (isGameOver) return
    setIsPlaying(prev => !prev)
  }

  const resetGame = () => {
    setIsPlaying(false)
    setIsGameOver(false)
    setBoard(createEmptyBoard())
    setCurrentPiece(null)
    setNextPiece(null)
    setScore(0)
    setLines(0)
    setLevel(1)
  }

  // Game loop
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      const speed = Math.max(100, 1000 - (level - 1) * 100)
      intervalRef.current = setInterval(() => {
        movePiece(0, 1)
      }, speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, isGameOver, movePiece, level])

  // Level progression
  useEffect(() => {
    setLevel(Math.floor(lines / 10) + 1)
  }, [lines])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          movePiece(0, 1)
          break
        case 'ArrowUp':
        case 'Space':
          e.preventDefault()
          handleRotate()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, isGameOver, movePiece, handleRotate])

  const renderBoard = () => {
    let displayBoard = board.map(row => [...row])
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const boardY = currentPiece.position.y + y
            const boardX = currentPiece.position.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-6 h-6 border border-gray-300"
            style={{
              backgroundColor: COLORS[cell],
              borderColor: cell === 0 ? '#e5e7eb' : '#374151'
            }}
          />
        ))}
      </div>
    ))
  }

  const renderNextPiece = () => {
    if (!nextPiece) return null

    return nextPiece.shape.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-4 h-4 border border-gray-300"
            style={{
              backgroundColor: cell === 0 ? 'transparent' : COLORS[cell],
              borderColor: cell === 0 ? 'transparent' : '#374151'
            }}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push('/game-center')}
        className="fixed top-4 left-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg border border-white/30 transition-colors"
      >
        <ArrowLeft size={24} className="text-white" />
      </button>

      <div className="max-w-4xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Game Board */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            テトリス
          </h1>
          
          <div className="bg-black p-4 rounded-lg shadow-2xl mx-auto" style={{ width: 'fit-content' }}>
            <div ref={boardRef} className="bg-gray-800 p-2 rounded">
              {renderBoard()}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden mt-6 grid grid-cols-3 gap-2 max-w-xs mx-auto">
            <button
              onClick={() => movePiece(-1, 0)}
              disabled={!isPlaying || isGameOver}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-4 rounded-lg font-bold"
            >
              ←
            </button>
            <button
              onClick={handleRotate}
              disabled={!isPlaying || isGameOver}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white p-4 rounded-lg font-bold"
            >
              ↻
            </button>
            <button
              onClick={() => movePiece(1, 0)}
              disabled={!isPlaying || isGameOver}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-4 rounded-lg font-bold"
            >
              →
            </button>
            <button
              onClick={() => movePiece(0, 1)}
              disabled={!isPlaying || isGameOver}
              className="col-start-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white p-4 rounded-lg font-bold"
            >
              ↓
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:w-64 bg-gray-800 p-6 rounded-lg shadow-xl">
          {/* Game Status */}
          <div className="text-white space-y-4 mb-6">
            <div>
              <div className="text-sm text-gray-300">スコア</div>
              <div className="text-2xl font-bold">{score.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-300">ライン</div>
              <div className="text-xl font-bold">{lines}</div>
            </div>
            <div>
              <div className="text-sm text-gray-300">レベル</div>
              <div className="text-xl font-bold">{level}</div>
            </div>
          </div>

          {/* Next Piece */}
          <div className="mb-6">
            <div className="text-white text-sm mb-2">次のピース</div>
            <div className="bg-gray-700 p-3 rounded">
              {renderNextPiece()}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {!isPlaying && !isGameOver && (
              <button
                onClick={startGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Play size={20} />
                スタート
              </button>
            )}

            {isPlaying && (
              <button
                onClick={togglePause}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Pause size={20} />
                ポーズ
              </button>
            )}

            <button
              onClick={resetGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              リセット
            </button>
          </div>

          {isGameOver && (
            <div className="mt-6 p-4 bg-red-600 rounded-lg">
              <div className="text-white text-center font-bold">
                ゲームオーバー！
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 text-xs text-gray-400">
            <div className="font-bold mb-2">操作方法:</div>
            <div>← → : 移動</div>
            <div>↓ : 高速落下</div>
            <div>↑/Space : 回転</div>
          </div>
        </div>
      </div>
    </div>
  )
}