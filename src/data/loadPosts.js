import matter from 'gray-matter'

const modules = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default' })

export async function loadPosts() {
  const posts = []

  for (const [path, loader] of Object.entries(modules)) {
    const raw = await loader()
    const { data, content } = matter(raw)

    // 从路径提取 id（取文件名前缀，确保唯一）
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

  // 按日期降序排列（最新的在前）
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))

  return posts
}
