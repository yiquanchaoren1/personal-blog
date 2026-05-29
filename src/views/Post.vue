<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { posts } from '../data/posts.js'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const post = computed(() => posts.find(p => p.id === route.params.id))

const md = new MarkdownIt({ html: true, linkify: true })
const renderedContent = computed(() => {
  return post.value ? md.render(post.value.content) : ''
})
</script>

<template>
  <div class="container">
    <div v-if="post" class="article-full">
      <router-link to="/blog" class="back-link">返回博客</router-link>
      <h1>{{ post.title }}</h1>
      <div class="article-meta">{{ post.date }}</div>
      <div class="tags" style="margin-bottom: 1.5rem;">
        <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="article-content" v-html="renderedContent"></div>
    </div>
    <div v-else>
      <p>文章未找到。</p>
      <router-link to="/blog" class="back-link">返回博客</router-link>
    </div>
  </div>
</template>
