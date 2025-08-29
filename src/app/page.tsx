'use client'

import { useState, useEffect } from 'react'
import { User, Plus, Mail, UserIcon, RefreshCw, Trash2 } from 'lucide-react'

interface UserData {
  id: number
  name: string
  email: string
  created_at: string
}

export default function Home() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ユーザー一覧を取得
  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError('ユーザーの取得に失敗しました')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

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
      fetchUsers() // ユーザー一覧を再取得
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの追加に失敗しました'
      setError(errorMessage)
      console.error('Error adding user:', err)
    } finally {
      setFormLoading(false)
    }
  }

  // ユーザーを削除
  const deleteUser = async (id: number) => {
    if (!confirm('このユーザーを削除しますか？')) return
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }
      setSuccess('ユーザーを削除しました')
      fetchUsers()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの削除に失敗しました'
      setError(errorMessage)
      console.error('Error deleting user:', err)
    }
  }

  // コンポーネントがマウントされたときにユーザー一覧を取得
  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">ユーザー管理</h1>
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
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ユーザー追加フォーム */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">新しいユーザーを追加</h2>
            </div>
            
            <form onSubmit={addUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  名前
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="田中太郎"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="example@example.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </form>
          </div>

          {/* ユーザー一覧 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">ユーザー一覧</h2>
              </div>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="更新"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">まだユーザーが登録されていません</p>
                <p className="text-sm text-gray-400 mt-1">左のフォームから新しいユーザーを追加してください</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>ID: {user.id}</span>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {user.created_at && (
                      <div className="mt-2 text-xs text-gray-400">
                        作成日: {new Date(user.created_at).toLocaleString('ja-JP')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">統計情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">総ユーザー数</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">API</span>
              </div>
              <p className="text-lg font-semibold text-green-900 mt-1">GET / POST / DELETE</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">データベース</span>
              </div>
              <p className="text-lg font-semibold text-purple-900 mt-1">Supabase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
