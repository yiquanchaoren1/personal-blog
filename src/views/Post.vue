<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { posts } from '../data/posts.js'
import { useMarkdown } from '../composables/useMarkdown.js'
import { getReadingTime } from '../composables/useReadingTime.js'
import { useScrollSpy } from '../composables/useScrollSpy.js'
import ReadingProgress from '../components/ReadingProgress.vue'
import BackToTop from '../components/BackToTop.vue'
import TableOfContents from '../components/TableOfContents.vue'

const route = useRoute()
const post = computed(() => posts.find(p => p.id === route.params.id))

const md = useMarkdown()

// Page entrance animation
const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})

// Extract headings for TOC
const tocHeadings = computed(() => {
  if (!post.value) return []
  const headings = []
  const regex = /^(#{2,3})\s+(.+)$/gm
  const content = post.value.content
  let match
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,  // 2 or 3
      text: match[2],
    })
  }
  return headings
})

// Reading time
const readingTime = computed(() => {
  return post.value ? getReadingTime(post.value.content) : { wordCount: 0, readingTime: 1 }
})

// Scroll spy for TOC active heading
const { activeHeadingId } = useScrollSpy()

// Markdown rendering - add ids to headings for TOC linking
function slugify(text) {
  return encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, '-'))
}

const renderedContent = computed(() => {
  if (!post.value) return ''
  let html = md.render(post.value.content)
  // Add id attributes to h2 and h3 for TOC scroll targeting
  tocHeadings.value.forEach((h) => {
    const id = slugify(h.text)
    const tag = `h${h.level}`
    const escapedText = h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    html = html.replace(
      new RegExp(`<${tag}>${escapedText}</${tag}>`),
      `<${tag} id="${id}">${h.text}</${tag}>`
    )
  })
  return html
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}
</script>

<template>
  <div class="page-view" :class="{ 'page-visible': visible }">
    <ReadingProgress />

    <div class="container">
      <div v-if="post" class="article-full">
        <router-link to="/blog" class="back-link">← 返回博客</router-link>
        <h1>{{ post.title }}</h1>
        <div class="article-meta">
          <span>{{ formatDate(post.date) }}</span>
          <span>·</span>
          <span>{{ readingTime.wordCount.toLocaleString() }} 字</span>
          <span>·</span>
          <span>阅读约 {{ readingTime.readingTime }} 分钟</span>
        </div>
        <div class="tags" style="margin-bottom: 1.5rem;">
          <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
        </div>

        <div class="post-layout">
          <main class="post-main">
            <div class="article-content" v-html="renderedContent"></div>
          </main>
          <aside class="post-sidebar">
            <TableOfContents :headings="tocHeadings" :active-id="activeHeadingId" />
          </aside>
        </div>
      </div>

      <div v-else class="not-found">
        <p>文章未找到。</p>
        <router-link to="/blog" class="back-link">← 返回博客</router-link>
      </div>
    </div>

    <BackToTop />
  </div>
</template>

<style scoped>
.post-layout {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 1.5rem;
  align-items: start;
}

.post-sidebar {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.post-main {
  min-width: 0;
}

.not-found {
  text-align: center;
  padding: 3rem 0;
}

@media (max-width: 768px) {
  .post-layout {
    grid-template-columns: 1fr;
  }
  .post-sidebar {
    position: static;
    order: -1;
    max-height: none;
    overflow-y: visible;
    margin-bottom: 1rem;
  }
}
</style>
