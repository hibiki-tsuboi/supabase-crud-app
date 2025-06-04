import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[handler]start')
  if (req.method === 'GET') {
    console.log('[handler]GET')
    const { data, error } = await supabase.from('users').select('*')
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    console.log('[handler]POST')
    const { name, email } = req.body
    const { data, error } = await supabase.from('users').insert([{ name, email }])
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
