'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Pause, Square, ArrowLeft } from 'lucide-react'

export default function StopwatchPage() {
  const router = useRouter()
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10)
      }, 10)
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
  }, [isRunning])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor((milliseconds % 1000) / 10)

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push('/game-center')}
        className="fixed top-4 left-4 p-2 bg-white hover:bg-gray-100 rounded-lg shadow-md transition-colors"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          ストップウォッチ
        </h1>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
            {formatTime(time)}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Play size={20} />
              スタート
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Pause size={20} />
              ストップ
            </button>
          )}
          
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Square size={20} />
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}