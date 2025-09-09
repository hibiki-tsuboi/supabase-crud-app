'use client'

import { useRouter } from 'next/navigation'
import { Clock, Gamepad2, ArrowLeft, Sparkles } from 'lucide-react'

export default function GameCenterPage() {
  const router = useRouter()

  const games = [
    {
      id: 'stopwatch',
      title: 'ストップウォッチ',
      description: '正確な時間測定ができるストップウォッチ機能',
      icon: Clock,
      color: 'from-blue-500 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:to-blue-800',
      path: '/stopwatch'
    },
    {
      id: 'slot',
      title: 'スロットマシン',
      description: '運試し！カジノ風スロットマシンゲーム',
      icon: Gamepad2,
      color: 'from-purple-500 to-purple-700',
      hoverColor: 'hover:from-purple-600 hover:to-purple-800',
      path: '/slot'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">ゲームセンター</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            楽しいゲームがいっぱい！
          </h2>
          <p className="text-white/70 text-lg">
            お好きなゲームを選んでお楽しみください
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => router.push(game.path)}
              className={`
                relative bg-gradient-to-br ${game.color}
                rounded-2xl shadow-2xl cursor-pointer
                transform transition-all duration-200
                hover:scale-102 hover:shadow-xl
                border border-white/20
              `}
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                    <game.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {game.title}
                  </h3>
                </div>
                
                <p className="text-white/90 text-lg leading-relaxed mb-6">
                  {game.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">
                    クリックして開始
                  </span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold text-white mb-4">
            🚀 Coming Soon
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {['🎯 ダーツゲーム', '🃏 ブラックジャック', '🎲 サイコロゲーム'].map((game, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4"
              >
                <p className="text-white/70">{game}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}