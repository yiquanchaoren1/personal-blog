<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  headings: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
})

const open = ref(false)

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

function scrollTo(id) {
  open.value = false
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <nav v-if="items.length > 0" class="toc" :class="{ open }">
    <button class="toc-toggle" @click="open = !open">
      <span class="toc-toggle-label">目录</span>
      <span class="toc-toggle-arrow" :class="{ rotated: open }">▾</span>
    </button>
    <ul class="toc-list">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="toc-item"
        :class="{ 'toc-indent': item.indent, 'toc-active': activeId === item.id }"
      >
        <a :href="'#' + item.id" @click.prevent="scrollTo(item.id)">
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
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  position: sticky;
  top: 80px;
  z-index: 10;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.toc-toggle {
  display: none;
  width: 100%;
  background: none;
  border: none;
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  justify-content: space-between;
  align-items: center;
  font-family: inherit;
}

.toc-toggle-arrow {
  transition: transform 0.2s;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.toc-toggle-arrow.rotated {
  transform: rotate(180deg);
}

.toc-list {
  list-style: none;
  padding: 0.3rem 0;
  margin: 0;
}

.toc-item a {
  display: block;
  font-size: 0.76rem;
  color: var(--text-muted);
  text-decoration: none;
  padding: 0.18rem 0.75rem;
  border-left: 2px solid transparent;
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
  padding-left: 1.4rem;
  font-size: 0.72rem;
}

@media (max-width: 768px) {
  .toc {
    position: fixed;
    bottom: 16px;
    left: 16px;
    right: 16px;
    top: auto;
    max-height: none;
    z-index: 99;
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .toc-toggle {
    display: flex;
  }

  .toc-list {
    display: none;
    max-height: 50vh;
    overflow-y: auto;
    border-top: 1px solid var(--border-light);
  }

  .toc.open .toc-list {
    display: block;
  }
}
</style>
