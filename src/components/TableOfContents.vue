<script setup>
import { computed } from 'vue'

const props = defineProps({
  headings: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
})

function slugify(text) {
  return encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, '-'))
}

const items = computed(() => {
  return props.headings.map((h) => ({
    ...h,
    id: slugify(h.text),
    indent: h.level === 3,
  }))
})
</script>

<template>
  <nav v-if="items.length > 0" class="toc">
    <h4 class="toc-title">目录</h4>
    <ul class="toc-list">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="toc-item"
        :class="{ 'toc-indent': item.indent, 'toc-active': activeId === item.id }"
      >
        <a :href="'#' + item.id" @click.prevent="document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })">
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.toc {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  padding: 0.85rem 1rem;
}

.toc-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: 0;
}

.toc-item a {
  display: block;
  font-size: 0.76rem;
  color: var(--text-muted);
  text-decoration: none;
  padding: 0.2rem 0;
  border-left: 2px solid transparent;
  padding-left: 0.6rem;
  transition: all 0.2s;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-item a:hover {
  color: var(--accent);
}

.toc-active a {
  color: var(--accent);
  border-left-color: var(--accent);
  font-weight: 600;
}

.toc-indent a {
  padding-left: 1.2rem;
  font-size: 0.72rem;
}
</style>
