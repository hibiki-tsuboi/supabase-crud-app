'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RotateCcw, User, Bot } from 'lucide-react'

type Player = 'X' | 'O' | null
type Board = Player[]
type GameMode = 'human' | 'ai'

export default function TicTacToePage() {
  const router = useRouter()
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<Player | 'draw' | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>('human')
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ]

  const checkWinner = (board: Board): Player | 'draw' | null => {
    for (const [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }
    if (board.every(cell => cell !== null)) {
      return 'draw'
    }
    return null
  }

  const makeMove = (index: number, player: 'X' | 'O') => {
    if (board[index] || winner) return false

    const newBoard = [...board]
    newBoard[index] = player
    setBoard(newBoard)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      setScores(prev => ({
        ...prev,
        [gameWinner === 'draw' ? 'draws' : gameWinner]: prev[gameWinner === 'draw' ? 'draws' : gameWinner] + 1
      }))
    } else {
      setCurrentPlayer(player === 'X' ? 'O' : 'X')
    }

    return true
  }

  const handleCellClick = (index: number) => {
    if (gameMode === 'ai' && currentPlayer === 'O') return
    makeMove(index, currentPlayer)
  }

  const getAIMove = (board: Board): number => {
    // Simple AI: try to win, then block player, then take center or corner
    const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[]
    
    // Try to win
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = 'O'
      if (checkWinner(testBoard) === 'O') {
        return move
      }
    }

    // Try to block player from winning
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = 'X'
      if (checkWinner(testBoard) === 'X') {
        return move
      }
    }

    // Take center if available
    if (board[4] === null) return 4

    // Take corners
    const corners = [0, 2, 6, 8].filter(i => board[i] === null)
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)]
    }

    // Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board)
        makeMove(aiMove, 'O')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentPlayer, gameMode, board, winner])

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
  }

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
    resetGame()
  }

  const switchGameMode = (mode: GameMode) => {
    setGameMode(mode)
    resetGame()
  }

  const getCellContent = (cell: Player) => {
    if (cell === 'X') return <span className="text-blue-600 text-4xl font-bold">✕</span>
    if (cell === 'O') return <span className="text-red-600 text-4xl font-bold">◯</span>
    return null
  }

  const getStatusMessage = () => {
    if (winner === 'draw') return '引き分け！'
    if (winner) return `${winner} の勝利！`
    if (gameMode === 'ai' && currentPlayer === 'O') return 'AIが考え中...'
    return `${currentPlayer} のターン`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 py-12 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push('/game-center')}
        className="fixed top-4 left-4 p-2 bg-white hover:bg-gray-100 rounded-lg shadow-md transition-colors"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>

      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          マルバツゲーム
        </h1>

        {/* Game Mode Selection */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => switchGameMode('human')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              gameMode === 'human' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <User size={18} />
            2人プレイ
          </button>
          <button
            onClick={() => switchGameMode('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
              gameMode === 'ai' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Bot size={18} />
            vs AI
          </button>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          <div className={`text-xl font-bold py-3 px-6 rounded-lg ${
            winner === 'draw' ? 'bg-yellow-100 text-yellow-800' :
            winner ? 'bg-green-100 text-green-800' :
            gameMode === 'ai' && currentPlayer === 'O' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getStatusMessage()}
          </div>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-2 mb-6 bg-gray-800 p-2 rounded-lg">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={cell !== null || winner !== null || (gameMode === 'ai' && currentPlayer === 'O')}
              className="aspect-square bg-white hover:bg-gray-100 disabled:hover:bg-white rounded-lg flex items-center justify-center transition-colors disabled:cursor-not-allowed"
            >
              {getCellContent(cell)}
            </button>
          ))}
        </div>

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-600 font-bold text-2xl">✕</div>
            <div className="text-sm text-gray-600">プレイヤー1</div>
            <div className="font-bold text-blue-600">{scores.X}</div>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600 font-bold text-lg">引き分け</div>
            <div className="font-bold text-gray-600">{scores.draws}</div>
          </div>
          <div className="text-center bg-red-50 p-3 rounded-lg">
            <div className="text-red-600 font-bold text-2xl">◯</div>
            <div className="text-sm text-gray-600">
              {gameMode === 'ai' ? 'AI' : 'プレイヤー2'}
            </div>
            <div className="font-bold text-red-600">{scores.O}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetGame}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            <RotateCcw size={18} />
            新しいゲーム
          </button>
          <button
            onClick={resetScores}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}