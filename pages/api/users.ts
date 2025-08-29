import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[handler]start')
  console.log('[handler]environment check:', {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
  })

  if (req.method === 'GET') {
    console.log('[handler]GET')
    try {
      const { id } = req.query
      let query = supabase.from('users').select('*')
      
      if (id && !Array.isArray(id)) {
        query = query.eq('id', id)
      }
      
      const { data, error } = await query
      console.log('[handler]supabase response:', { data, error })
      if (error) {
        console.error('[handler]supabase error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json(data)
    } catch (err) {
      console.error('[handler]unexpected error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    console.log('[handler]POST')
    const { name, email } = req.body
    try {
      const { data, error } = await supabase.from('users').insert([{ name, email }])
      console.log('[handler]supabase insert response:', { data, error })
      if (error) {
        console.error('[handler]supabase insert error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(201).json(data)
    } catch (err) {
      console.error('[handler]unexpected insert error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    console.log('[handler]PUT')
    const { id, name, email } = req.body
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', id)
        .select()
      console.log('[handler]supabase update response:', { data, error })
      if (error) {
        console.error('[handler]supabase update error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json(data)
    } catch (err) {
      console.error('[handler]unexpected update error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    console.log('[handler]DELETE')
    const { id } = req.query
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid user id' })
    }
    try {
      const { error } = await supabase.from('users').delete().eq('id', id)
      console.log('[handler]supabase delete response:', { error })
      if (error) {
        console.error('[handler]supabase delete error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json({ message: 'User deleted successfully' })
    } catch (err) {
      console.error('[handler]unexpected delete error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
