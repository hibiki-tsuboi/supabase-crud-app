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
      const { data, error } = await supabase.from('users').select('*')
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

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
