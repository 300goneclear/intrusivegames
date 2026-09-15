export default async (req: Request) => {
  const token = process.env.NOTION_TOKEN
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!token || !databaseId) {
    return new Response('Missing NOTION_TOKEN or NOTION_DATABASE_ID env vars', { status: 500 })
  }

  const results: any[] = []
  let cursor: string | undefined = undefined

  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor })
    })
    if (!res.ok) {
      return new Response('Notion API error: ' + res.status, { status: 502 })
    }
    const data = await res.json()
    results.push(...data.results)
    cursor = data.has_more ? data.next_cursor : undefined
  } while (cursor)

  const players = results
    .map((page: any) => {
      const name = page.properties?.Name?.title?.[0]?.plain_text?.trim() || ''
      const gender = page.properties?.Gender?.select?.name || ''
      return { name, gender }
    })
    .filter((p: any) => p.name.length > 0)

  return Response.json(players, {
    headers: { 'Cache-Control': 'public, max-age=30' }
  })
}

export const config = { path: '/.netlify/functions/roster' }
