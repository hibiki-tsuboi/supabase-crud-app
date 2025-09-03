import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query
      let query = supabase.from('users').select('*')
      
      if (id && !Array.isArray(id)) {
        query = query.eq('id', id)
      }
      
      const { data, error } = await query
      if (error) {
        console.error('Supabase error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json(data)
    } catch (err) {
      console.error('Unexpected error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { name, email } = req.body
    try {
      const { data, error } = await supabase.from('users').insert([{ name, email }])
      if (error) {
        console.error('Supabase insert error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(201).json(data)
    } catch (err) {
      console.error('Unexpected insert error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
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
      if (error) {
        console.error('Supabase update error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json(data)
    } catch (err) {
      console.error('Unexpected update error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid user id' })
    }
    try {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) {
        console.error('Supabase delete error:', error)
        return res.status(500).json({ error: error.message })
      }
      return res.status(200).json({ message: 'User deleted successfully' })
    } catch (err) {
      console.error('Unexpected delete error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
