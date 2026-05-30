<script setup>
import { ref, onMounted } from 'vue'
import { posts, getCategories } from '../data/posts.js'
import { getReadingTime } from '../composables/useReadingTime.js'
import ScrollReveal from '../components/ScrollReveal.vue'

const categories = getCategories(posts)
const expanded = ref(null)

function toggleCategory(name) {
  expanded.value = expanded.value === name ? null : name
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}

const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})
</script>

<template>
  <div class="page-view" :class="{ 'page-visible': visible }">
    <div class="container">
      <h1 class="section-title">文章分类</h1>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin: -1rem 0 1.5rem;">
        共 {{ categories.length }} 个分类
      </p>

      <div class="category-grid">
        <ScrollReveal v-for="cat in categories" :key="cat.name">
          <div
            class="category-card"
            :class="{ 'category-card--open': expanded === cat.name }"
            @click="toggleCategory(cat.name)"
            data-tilt
          >
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">{{ cat.count }} 篇</span>
            <span class="category-arrow">{{ expanded === cat.name ? '▾' : '▸' }}</span>

            <div v-if="expanded === cat.name" class="category-posts" @click.stop>
              <article v-for="post in cat.posts" :key="post.id" class="article-card">
                <h2>
                  <router-link :to="`/blog/${post.id}`">{{ post.title }}</router-link>
                </h2>
                <div class="article-meta">
                  <span>{{ formatDate(post.date) }}</span>
                  <span>&middot;</span>
                  <span>阅读约 {{ getReadingTime(post.content).readingTime }} 分钟</span>
                </div>
                <p class="article-summary">{{ post.summary }}</p>
              </article>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <p v-if="categories.length === 0" style="text-align:center;color:var(--text-muted);padding:3rem 0;">暂无分类</p>
    </div>
  </div>
</template>
