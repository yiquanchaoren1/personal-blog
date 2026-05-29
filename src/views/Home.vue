<script setup>
import { posts, skills } from '../data/posts.js'

const recentPosts = posts.slice(0, 3)
</script>

<template>
  <div class="hero container">
    <div class="hero-avatar-wrap">
      <div class="hero-avatar">&#x1f9d1;&#x200d;&#x1f4bb;</div>
    </div>
    <h1>你好，我是 Lemon</h1>
    <p class="subtitle">全栈开发者，热衷于构建优雅的 Web 体验。这里记录我的技术探索与思考。</p>
  </div>

  <div class="container home-grid">
    <section>
      <h2 class="section-title">技能</h2>
      <div class="skills-grid">
        <span class="skill-tag" v-for="skill in skills" :key="skill">{{ skill }}</span>
      </div>
    </section>

    <section>
      <h2 class="section-title">最新文章</h2>
      <article class="article-card" v-for="post in recentPosts" :key="post.id">
        <h2>
          <router-link :to="`/blog/${post.id}`">{{ post.title }}</router-link>
        </h2>
        <div class="article-meta">{{ post.date }}</div>
        <p class="article-summary">{{ post.summary }}</p>
        <div class="tags">
          <span class="tag" v-for="tag in post.tags" :key="tag">{{ tag }}</span>
        </div>
      </article>
      <router-link to="/blog" class="back-link">查看全部文章 &rarr;</router-link>
    </section>
  </div>
</template>
