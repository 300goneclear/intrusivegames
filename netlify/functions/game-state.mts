import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const ALLOWED_KEYS = new Set(['game-state', 'imposter-state-v2', 'confessions-state'])

export default async (req: Request, context: Context) => {
  const key = new URL(req.url).searchParams.get('key') ?? ''
  if (!ALLOWED_KEYS.has(key)) {
    return new Response('Unknown key', { status: 400 })
  }

  const store = getStore({ name: 'intrusive-games', consistency: 'strong' })

  if (req.method === 'GET') {
    const data = await store.get(key, { type: 'json' })
    if (data === null || data === undefined) {
      return new Response(null, { status: 404 })
    }
    return Response.json(data)
  }

  if (req.method === 'POST') {
    const body = await req.json()
    await store.setJSON(key, body)
    return new Response('OK')
  }

  return new Response('Method not allowed', { status: 405 })
}
