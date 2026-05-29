import { loadPosts } from './loadPosts.js'

export const posts = await loadPosts()

export const skills = [
  'Vue.js', 'React', 'TypeScript', 'JavaScript',
  'Node.js', 'Python', 'CSS/SCSS', 'Tailwind',
  'Git', 'Docker', 'MySQL', 'Linux',
]
