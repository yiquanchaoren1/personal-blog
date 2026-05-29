<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { posts, skills } from '../data/posts.js'
import CryptoCard from '../components/CryptoCard.vue'

const recentPosts = posts.slice(0, 3)

// 粒子背景
const canvas = ref(null)
let animId = null

onMounted(() => {
  const cvs = canvas.value
  if (!cvs) return
  const ctx = cvs.getContext('2d')
  const particles = []
  const max = 50

  function resize() {
    cvs.width = cvs.offsetWidth
    cvs.height = cvs.offsetHeight
  }
  resize()
  window.addEventListener('resize', resize)

  for (let i = 0; i < max; i++) {
    particles.push({
      x: Math.random() * cvs.width,
      y: Math.random() * cvs.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    })
  }

  function draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height)
    for (const p of particles) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(100,255,218,${p.alpha})`
      ctx.fill()
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = cvs.width
      if (p.x > cvs.width) p.x = 0
      if (p.y < 0) p.y = cvs.height
      if (p.y > cvs.height) p.y = 0

      // 连线
      for (const q of particles) {
        const dx = p.x - q.x
        const dy = p.y - q.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.strokeStyle = `rgba(100,255,218,${0.04 * (1 - dist / 100)})`
          ctx.stroke()
        }
      }
    }
    animId = requestAnimationFrame(draw)
  }
  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<template>
  <div class="hero container" style="position: relative; overflow: hidden;">
    <canvas ref="canvas" class="particle-canvas"></canvas>
    <div style="position: relative; z-index: 1;">
      <div class="hero-avatar-wrap">
        <div class="hero-avatar">&#x1f9d1;&#x200d;&#x1f4bb;</div>
      </div>
      <h1>你好，我是 Lemon</h1>
      <p class="subtitle">全栈开发者，热衷于构建优雅的 Web 体验。这里记录我的技术探索与思考。</p>
    </div>
  </div>

  <div class="container home-grid">
    <section>
      <h2 class="section-title">技能</h2>
      <div class="skills-grid">
        <span class="skill-tag" v-for="skill in skills" :key="skill">{{ skill }}</span>
      </div>
    </section>

    <CryptoCard />

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
      <router-link to="/blog" class="back-link" style="margin-top: 0.25rem;">查看全部文章 &rarr;</router-link>
    </section>
  </div>
</template>
