'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { User, Mail, UserIcon, RefreshCw, ArrowLeft, Calendar, Eye, Trash2, Edit } from 'lucide-react'

interface UserData {
  id: number
  name: string
  email: string
  created_at: string
}

export default function UserDetail() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
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
      setUser(data[0])
    } catch (err) {
      setError('ユーザーの取得に失敗しました')
      console.error('Error fetching user:', err)
    } finally {
      setLoading(false)
    }
  }

  // ユーザーを削除
  const deleteUser = async () => {
    if (!confirm('このユーザーを削除しますか？')) return
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }
      setSuccess('ユーザーを削除しました')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザーの削除に失敗しました'
      setError(errorMessage)
      console.error('Error deleting user:', err)
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
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ユーザー管理に戻る
          </button>
          
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">ユーザー詳細</h1>
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
            <p className="text-green-600 text-sm mt-1">2秒後にユーザー管理画面に戻ります...</p>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* ユーザー基本情報 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gray-100 rounded-full">
                  <UserIcon className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">ユーザーID</span>
                  </div>
                  <p className="text-gray-700 text-lg">{user.id}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">作成日時</span>
                  </div>
                  <p className="text-gray-700">
                    {new Date(user.created_at).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">メールドメイン</span>
                  </div>
                  <p className="text-gray-700">@{user.email.split('@')[1]}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">名前の長さ</span>
                  </div>
                  <p className="text-gray-700">{user.name.length}文字</p>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push(`/users/${user.id}/edit`)}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  編集
                </button>
                
                <button
                  onClick={deleteUser}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  削除
                </button>
              </div>
            </div>

            {/* システム情報 */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">システム情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">データベース:</span>
                  <span className="text-blue-700 ml-2">Supabase</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">テーブル:</span>
                  <span className="text-blue-700 ml-2">users</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">最終更新:</span>
                  <span className="text-blue-700 ml-2">
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">ステータス:</span>
                  <span className="text-green-700 ml-2">アクティブ</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}