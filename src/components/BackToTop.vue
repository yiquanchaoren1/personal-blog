<script setup>
import { useScrollSpy } from '../composables/useScrollSpy.js'

const { showBackToTop } = useScrollSpy()

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="btt-fade">
    <button
      v-if="showBackToTop"
      class="back-to-top"
      @click="scrollToTop"
      title="回到顶部"
      aria-label="回到顶部"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 99;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  transition: all 0.25s;
}
.back-to-top:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.btt-fade-enter-active { transition: all 0.3s ease; }
.btt-fade-leave-active { transition: all 0.2s ease; }
.btt-fade-enter-from,
.btt-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
