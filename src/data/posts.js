import { loadPosts } from './loadPosts.js'

export const posts = await loadPosts()

export const skills = [
  'Vue.js', 'React', 'TypeScript', 'JavaScript',
  'Node.js', 'Python', 'CSS/SCSS', 'Tailwind',
  'Git', 'Docker', 'MySQL', 'Linux',
]

// Group posts by year and month for Archives page
export function getArchiveGroups(posts) {
  const map = {}
  for (const post of posts) {
    if (!post.date) continue
    const d = new Date(post.date)
    if (isNaN(d.getTime())) continue
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    if (!map[year]) map[year] = {}
    if (!map[year][month]) map[year][month] = []
    map[year][month].push(post)
  }
  const monthLabels = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  return Object.entries(map)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, months]) => ({
      year: Number(year),
      months: Object.entries(months)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([m, posts]) => ({ month: m, label: monthLabels[Number(m) - 1], posts }))
    }))
}

// Group posts by first tag for Categories page
export function getCategories(posts) {
  const map = {}
  for (const post of posts) {
    const cat = (post.tags && post.tags.length > 0) ? post.tags[0] : '未分类'
    if (!map[cat]) map[cat] = { name: cat, count: 0, posts: [] }
    map[cat].count++
    map[cat].posts.push(post)
  }
  return Object.values(map).sort((a, b) => b.count - a.count)
}

// Get all unique tags with counts for Tags page
export function getAllTags(posts) {
  const map = {}
  for (const post of posts) {
    if (!post.tags) continue
    for (const tag of post.tags) {
      if (!map[tag]) map[tag] = { name: tag, count: 0 }
      map[tag].count++
    }
  }
  return Object.values(map).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

// About page config
export const about = {
  name: 'Lemon',
  avatar: '\u{1F9D1}‍\u{1F4BB}',
  bio: '全栈开发者，热衷于构建优雅的 Web 体验。这里记录我的技术探索与思考。',
  social: [
    { name: 'GitHub', url: 'https://github.com/' },
    { name: 'Email', url: 'mailto:' },
  ]
}
