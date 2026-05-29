const modules = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default' })

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const fm = match[1]
  const content = match[2]
  const data = {}

  for (const line of fm.split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    let value = line.slice(colon + 1).trim()

    // 数组: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim())
    }
    // 去掉引号
    if (typeof value === 'string' && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1)
    }
    data[key] = value
  }

  return { data, content }
}

export async function loadPosts() {
  const posts = []

  for (const [path, loader] of Object.entries(modules)) {
    const raw = await loader()
    const { data, content } = parseFrontmatter(raw)

    const filename = path.split('/').pop().replace('.md', '')

    posts.push({
      id: filename,
      title: data.title || filename,
      date: data.date || '',
      summary: data.summary || '',
      tags: data.tags || [],
      content: content.trim(),
    })
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  return posts
}
