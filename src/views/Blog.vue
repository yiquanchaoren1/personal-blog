<script setup>
import { posts } from '../data/posts.js'
</script>

<template>
  <div class="container">
    <h1 class="section-title">博客文章</h1>
    <p style="color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin: -1rem 0 1.5rem; letter-spacing: 1px;">
      // TOTAL: {{ posts.length }} ARTICLES
    </p>
    <article class="article-card" v-for="post in posts" :key="post.id">
      <h2>
        <router-link :to="`/blog/${post.id}`">{{ post.title }}</router-link>
      </h2>
      <div class="article-meta">{{ post.date }}</div>
      <p class="article-summary">{{ post.summary }}</p>
      <div class="tags">
        <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
      </div>
    </article>
  </div>
</template>
