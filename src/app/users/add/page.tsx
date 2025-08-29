'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Plus, Mail, UserIcon, RefreshCw, ArrowLeft } from 'lucide-react'

export default function AddUser() {
  const router = useRouter()
  const [formLoading, setFormLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 新しいユーザーを追加
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('名前とメールアドレスは必須です')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add user')
      }

      setSuccess('ユーザーが正常に追加されました！')
      setName('')
      setEmail('')
      
      // 3秒後にユーザー管理画面に戻る
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの追加に失敗しました'
      setError(errorMessage)
      console.error('Error adding user:', err)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ユーザー管理に戻る
          </button>
          
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">新しいユーザーを追加</h1>
            </div>
          </div>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
            <p className="text-green-600 text-sm mt-1">3秒後にユーザー管理画面に戻ります...</p>
          </div>
        )}

        {/* ユーザー追加フォーム */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={addUser} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                <UserIcon className="w-4 h-4 inline mr-2" />
                名前
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-lg"
                placeholder="田中太郎"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                <Mail className="w-4 h-4 inline mr-2" />
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-lg"
                placeholder="example@example.com"
                required
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                キャンセル
              </button>
              
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    追加中...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    ユーザーを追加
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 使用方法 */}
        <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">使用方法</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              名前とメールアドレスを入力してください
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              メールアドレスは有効な形式で入力する必要があります
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              追加が完了すると自動的にユーザー管理画面に戻ります
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}