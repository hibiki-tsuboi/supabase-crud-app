'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { User, Mail, UserIcon, RefreshCw, ArrowLeft, Save, X } from 'lucide-react'

interface UserData {
  id: number
  name: string
  email: string
  created_at: string
}

export default function EditUser() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const userId = params.id as string

  // ユーザー詳細を取得
  const fetchUser = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/users?id=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      const data = await response.json()
      if (data.length === 0) {
        throw new Error('User not found')
      }
      const userData = data[0]
      setUser(userData)
      setName(userData.name)
      setEmail(userData.email)
    } catch (err) {
      setError('ユーザーの取得に失敗しました')
      console.error('Error fetching user:', err)
    } finally {
      setLoading(false)
    }
  }

  // ユーザーを更新
  const updateUser = async (e: React.FormEvent) => {
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: userId,
          name: name.trim(), 
          email: email.trim() 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user')
      }

      setSuccess('ユーザーが正常に更新されました！')
      
      // 3秒後にユーザー詳細画面に戻る
      setTimeout(() => {
        router.push(`/users/${userId}`)
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの更新に失敗しました'
      setError(errorMessage)
      console.error('Error updating user:', err)
    } finally {
      setFormLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ユーザー管理に戻る
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 text-lg">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ユーザー一覧に戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/users/${userId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ユーザー詳細に戻る
          </button>
          
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="p-3 bg-orange-600 rounded-xl">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">ユーザー編集</h1>
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
            <p className="text-green-600 text-sm mt-1">3秒後にユーザー詳細画面に戻ります...</p>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* 現在の情報表示 */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">現在の情報</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-blue-800">名前:</span>
                  <p className="text-blue-900 font-semibold">{user.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-800">メールアドレス:</span>
                  <p className="text-blue-900 font-semibold">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-800">ユーザーID:</span>
                  <p className="text-blue-900 font-semibold">{user.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-800">作成日:</span>
                  <p className="text-blue-900 font-semibold">
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>

            {/* 編集フォーム */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">新しい情報を入力</h3>
              
              <form onSubmit={updateUser} className="space-y-6">
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
                  {name !== user.name && (
                    <p className="text-sm text-orange-600 mt-1">
                      変更: "{user.name}" → "{name}"
                    </p>
                  )}
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
                  {email !== user.email && (
                    <p className="text-sm text-orange-600 mt-1">
                      変更: "{user.email}" → "{email}"
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/users/${userId}`)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    キャンセル
                  </button>
                  
                  <button
                    type="submit"
                    disabled={formLoading || (name === user.name && email === user.email)}
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        変更を保存
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">注意事項</h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  変更内容は即座にデータベースに反映されます
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  メールアドレスは有効な形式で入力する必要があります
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  変更がない場合は保存ボタンが無効になります
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}