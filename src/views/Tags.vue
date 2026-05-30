<script setup>
import { ref, computed, onMounted } from 'vue'
import { posts, getAllTags } from '../data/posts.js'
import { getReadingTime } from '../composables/useReadingTime.js'
import ScrollReveal from '../components/ScrollReveal.vue'

const tags = getAllTags(posts)
const selectedTag = ref(null)

const filteredPosts = computed(() => {
  if (!selectedTag.value) return []
  return posts.filter(p => p.tags && p.tags.includes(selectedTag.value))
})

function selectTag(name) {
  selectedTag.value = selectedTag.value === name ? null : name
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}

function tagStyle(tag) {
  const max = Math.max(...tags.map(t => t.count), 1)
  const min = Math.min(...tags.map(t => t.count), 1)
  const scale = max === min ? 1 : (tag.count - min) / (max - min)
  const size = 0.82 + scale * 0.5
  const opacity = 0.55 + scale * 0.45
  return { fontSize: size + 'rem', opacity }
}

const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})
</script>

<template>
  <div class="page-view" :class="{ 'page-visible': visible }">
    <div class="container">
      <h1 class="section-title">标签</h1>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin: -1rem 0 1.5rem;">
        共 {{ tags.length }} 个标签
      </p>

      <div class="tag-cloud">
        <span
          v-for="tag in tags"
          :key="tag.name"
          class="tag-item"
          :class="{ active: selectedTag === tag.name }"
          :style="tagStyle(tag)"
          @click="selectTag(tag.name)"
        >
          {{ tag.name }} <sup>{{ tag.count }}</sup>
        </span>
      </div>

      <div v-if="selectedTag" class="tag-posts">
        <h2 style="font-size:1.1rem;margin-bottom:1rem;color:var(--text);">
          标签：<span style="color:var(--accent)">{{ selectedTag }}</span>
          <span style="font-weight:400;font-size:0.85rem;color:var(--text-muted)">（{{ filteredPosts.length }} 篇）</span>
        </h2>
        <ScrollReveal v-for="post in filteredPosts" :key="post.id">
          <article class="article-card" data-tilt>
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
  </div>
</template>
