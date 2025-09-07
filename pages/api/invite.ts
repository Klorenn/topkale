import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Client ID del bot Kale configurado
  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '1414030545083433001'
  
  // Permisos necesarios para el bot Kale
  const PERMISSIONS = '2048' // Send Messages, Use Slash Commands, Embed Links
  const SCOPE = 'bot%20applications.commands'
  
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${PERMISSIONS}&scope=${SCOPE}`
  
  if (req.method === 'GET') {
    res.redirect(inviteUrl)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
