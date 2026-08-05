import crypto from 'crypto'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { password } = body
  const expectedPassword = process.env.ADMIN_PASSWORD || 'Asmin2026!'

  if (!password || password !== expectedPassword) {
    return res.status(401).json({ error: 'Geçersiz şifre.' })
  }

  // Generate secure HMAC session token
  const token = crypto
    .createHmac('sha256', expectedPassword)
    .update('authenticated_admin_session_v1')
    .digest('hex')

  return res.status(200).json({ success: true, token })
}
