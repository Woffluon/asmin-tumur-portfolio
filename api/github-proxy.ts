import crypto from 'crypto'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  const expectedPassword = process.env.ADMIN_PASSWORD || 'Asmin2026!'
  const expectedToken = crypto
    .createHmac('sha256', expectedPassword)
    .update('authenticated_admin_session_v1')
    .digest('hex')

  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Yetkisiz erişim. Lütfen tekrar giriş yapın.' })
  }

  const patToken = process.env.GITHUB_PAT
  const owner = process.env.GITHUB_OWNER || 'woffluon'
  const repo = process.env.GITHUB_REPO || 'asmin-tumur-portfolio'

  if (!patToken) {
    return res.status(500).json({ error: 'Sunucuda GITHUB_PAT anahtarı tanımlanmamış.' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { action, path, content, message } = body

  if (action === 'get-sha') {
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Authorization: `Bearer ${patToken.trim()}`,
          Accept: 'application/vnd.github+json',
        },
      })
      if (ghRes.ok) {
        const data: any = await ghRes.json()
        return res.status(200).json({ sha: data.sha || null })
      }
      return res.status(200).json({ sha: null })
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (action === 'save-file') {
    try {
      // First get SHA
      let sha: string | null = null
      const shaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: {
          Authorization: `Bearer ${patToken.trim()}`,
          Accept: 'application/vnd.github+json',
        },
      })
      if (shaRes.ok) {
        const shaData: any = await shaRes.json()
        sha = shaData.sha || null
      }

      const bodyPayload: Record<string, unknown> = {
        message: message || `update ${path}`,
        content,
        branch: 'main',
      }
      if (sha) {
        bodyPayload.sha = sha
      }

      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${patToken.trim()}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      })

      if (!ghRes.ok) {
        const errData: any = await ghRes.json()
        return res.status(ghRes.status).json({ error: errData.message || 'GitHub API hatası.' })
      }

      const result: any = await ghRes.json()
      return res.status(200).json({ success: true, result })
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(400).json({ error: 'Geçersiz işlem.' })
}
