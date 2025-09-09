'use client'

import { useState, useRef } from 'react'
import { Play, RotateCcw, Coins } from 'lucide-react'

const SYMBOLS = ['🍎', '🍌', '🍒', '🍇', '🍊', '⭐', '💎']
const SPIN_DURATION = 2000

export default function SlotMachinePage() {
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]])
  const [isSpinning, setIsSpinning] = useState(false)
  const [score, setScore] = useState(1000)
  const [lastWin, setLastWin] = useState(0)
  const [message, setMessage] = useState('')
  const intervalRefs = useRef<NodeJS.Timeout[]>([])

  const spinReel = (reelIndex: number, duration: number) => {
    let spinCount = 0
    const maxSpins = Math.floor(duration / 100) + Math.random() * 10
    
    const interval = setInterval(() => {
      setReels(prev => {
        const newReels = [...prev]
        newReels[reelIndex] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        return newReels
      })
      
      spinCount++
      if (spinCount >= maxSpins) {
        clearInterval(interval)
      }
    }, 100)
    
    intervalRefs.current[reelIndex] = interval
  }

  const checkWin = (finalReels: string[]) => {
    const [reel1, reel2, reel3] = finalReels
    
    if (reel1 === reel2 && reel2 === reel3) {
      // 3つ全て同じ
      let multiplier = 50
      if (reel1 === '💎') multiplier = 500
      else if (reel1 === '⭐') multiplier = 200
      else if (reel1 === '🍒') multiplier = 100
      
      setLastWin(multiplier)
      setScore(prev => prev + multiplier)
      setMessage(`🎉 ジャックポット！ ${multiplier}ポイント獲得！`)
      return true
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      // 2つ同じ
      const winAmount = 10
      setLastWin(winAmount)
      setScore(prev => prev + winAmount)
      setMessage(`✨ ペア！ ${winAmount}ポイント獲得！`)
      return true
    }
    
    setLastWin(0)
    setMessage('残念... もう一度挑戦！')
    return false
  }

  const spin = () => {
    if (isSpinning || score < 10) return
    
    setIsSpinning(true)
    setScore(prev => prev - 10)
    setMessage('スピン中...')
    
    // Clear any existing intervals
    intervalRefs.current.forEach(interval => {
      if (interval) clearInterval(interval)
    })
    
    // Start spinning each reel with different durations
    spinReel(0, SPIN_DURATION - 500)
    spinReel(1, SPIN_DURATION)
    spinReel(2, SPIN_DURATION + 500)
    
    // Stop spinning after duration
    setTimeout(() => {
      intervalRefs.current.forEach(interval => {
        if (interval) clearInterval(interval)
      })
      
      // Generate final results
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]
      
      setReels(finalReels)
      checkWin(finalReels)
      setIsSpinning(false)
    }, SPIN_DURATION + 1000)
  }

  const reset = () => {
    setScore(1000)
    setLastWin(0)
    setMessage('')
    setReels([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 py-12">
      <div className="max-w-lg mx-auto bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl shadow-2xl p-8 border-4 border-yellow-300">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-900">
          🎰 スロットマシン
        </h1>
        
        {/* Score Display */}
        <div className="text-center mb-6">
          <div className="bg-black text-green-400 font-mono text-2xl font-bold px-6 py-3 rounded-lg inline-block border-2 border-gray-400">
            <Coins className="inline w-6 h-6 mr-2" />
            {score.toLocaleString()}
          </div>
          {lastWin > 0 && (
            <div className="text-lg font-bold text-green-800 mt-2">
              +{lastWin} ポイント獲得！
            </div>
          )}
        </div>

        {/* Slot Machine Display */}
        <div className="bg-black p-6 rounded-xl mb-6 border-4 border-gray-300">
          <div className="flex justify-center items-center gap-4">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`w-20 h-20 bg-white rounded-lg flex items-center justify-center text-5xl border-4 border-gray-400 ${
                  isSpinning ? 'animate-pulse' : ''
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="text-center mb-6 p-4 bg-white/90 rounded-lg border-2 border-yellow-300">
            <p className="text-lg font-bold text-purple-900">{message}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <button
            onClick={spin}
            disabled={isSpinning || score < 10}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-xl transition-all ${
              isSpinning || score < 10
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <Play size={24} />
            {isSpinning ? 'スピン中...' : 'スピン (10ポイント)'}
          </button>

          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <RotateCcw size={20} />
            リセット
          </button>
        </div>

        {/* Game Info */}
        <div className="mt-6 text-sm text-purple-900 bg-white/50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">配当表:</h3>
          <div className="space-y-1">
            <div>💎💎💎: 500pt</div>
            <div>⭐⭐⭐: 200pt</div>
            <div>🍒🍒🍒: 100pt</div>
            <div>その他3つ揃い: 50pt</div>
            <div>2つ揃い: 10pt</div>
          </div>
        </div>
      </div>
    </div>
  )
}