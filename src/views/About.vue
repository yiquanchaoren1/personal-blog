<script setup>
import { ref, onMounted } from 'vue'
import { skills, about } from '../data/posts.js'

const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})
</script>

<template>
  <div class="page-view" :class="{ 'page-visible': visible }">
    <div class="container">
      <div class="about-hero">
        <div class="about-avatar">{{ about.avatar }}</div>
        <h1>{{ about.name }}</h1>
        <p class="about-bio">{{ about.bio }}</p>
        <div class="about-social">
          <a
            v-for="link in about.social"
            :key="link.name"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
          >{{ link.name }}</a>
        </div>
      </div>

      <section style="margin-top:2rem;">
        <h2 class="section-title">技能</h2>
        <div class="skills-grid">
          <span
            v-for="(skill, i) in skills"
            :key="skill"
            class="skill-tag"
            data-magnetic
          >{{ skill }}</span>
        </div>
      </section>

      <section style="margin-top:2.5rem;">
        <h2 class="section-title">关于本站</h2>
        <div class="article-card" style="line-height:1.9;">
          <p style="color:var(--text-muted);margin-bottom:0.6rem;">
            使用 <strong style="color:var(--text);">Vue 3</strong> + <strong style="color:var(--text);">Vite</strong> 构建，
            通过 <strong style="color:var(--text);">Markdown</strong> 写作。
          </p>
          <p style="color:var(--text-muted);margin-bottom:0.6rem;">
            部署在 GitHub Pages，全部源码开源。
          </p>
          <p style="color:var(--text-muted);margin-bottom:0.6rem;">
            主题风格参考 <a href="https://linn-ylz.com/" target="_blank" style="color:var(--accent);">Linn</a>，
            追求简洁、易读、中英文混排友好的阅读体验。
          </p>
          <p style="color:var(--text-muted);">
            持续更新中，记录技术探索与思考。
          </p>
        </div>
      </section>
    </div>
  </div>
</template>
