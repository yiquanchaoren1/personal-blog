<script setup>
import { ref, onMounted } from 'vue'
import { posts, getArchiveGroups } from '../data/posts.js'
import { getReadingTime } from '../composables/useReadingTime.js'
import ScrollReveal from '../components/ScrollReveal.vue'

const groups = getArchiveGroups(posts)

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
  <div class="page-view" :class="{ 'page-visible': visible }">
    <div class="container">
      <h1 class="section-title">文章归档</h1>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin: -1rem 0 1.5rem;">
        共 {{ posts.length }} 篇文章
      </p>

      <section v-for="yearGroup in groups" :key="yearGroup.year" class="timeline-section">
        <h2 class="timeline-year">{{ yearGroup.year }}</h2>
        <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="timeline-month">
          <h3>{{ monthGroup.label }} <span style="font-weight:400;font-size:0.8rem;color:var(--text-muted)">({{ monthGroup.posts.length }} 篇)</span></h3>
          <ScrollReveal v-for="post in monthGroup.posts" :key="post.id">
            <article class="article-card timeline-item">
              <span class="timeline-dot"></span>
              <time class="timeline-date">{{ formatDate(post.date) }}</time>
              <h2>
                <router-link :to="`/blog/${post.id}`">{{ post.title }}</router-link>
              </h2>
              <div class="article-meta">
                <span>阅读约 {{ getReadingTime(post.content).readingTime }} 分钟</span>
              </div>
              <p class="article-summary">{{ post.summary }}</p>
              <div class="tags">
                <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </section>

      <p v-if="groups.length === 0" style="text-align:center;color:var(--text-muted);padding:3rem 0;">暂无文章</p>
    </div>
  </div>
</template>
