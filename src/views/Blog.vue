<script setup>
import { ref, onMounted } from 'vue'
import { posts } from '../data/posts.js'
import { getReadingTime } from '../composables/useReadingTime.js'
import ScrollReveal from '../components/ScrollReveal.vue'

const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}
</script>

<template>
  <div class="page-view blog-bg" :class="{ 'page-visible': visible }">
    <div class="container">
      <h1 class="section-title">博客文章</h1>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin: -1rem 0 1.5rem;">
        共 {{ posts.length }} 篇文章
      </p>
      <ScrollReveal v-for="post in posts" :key="post.id">
        <article class="article-card" data-tilt data-magnetic>
          <h2>
            <router-link :to="`/blog/${post.id}`">{{ post.title }}</router-link>
          </h2>
          <div class="article-meta">
            <span>{{ formatDate(post.date) }}</span>
            <span>&middot;</span>
            <span>阅读约 {{ getReadingTime(post.content).readingTime }} 分钟</span>
          </div>
          <p class="article-summary">{{ post.summary }}</p>
          <div class="tags">
            <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
          </div>
        </article>
      </ScrollReveal>
    </div>
  </div>
</template>
