<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const root = ref(null)
const revealed = ref(false)
let observer = null

onMounted(() => {
  if (!root.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        revealed.value = true
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.1 }
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div ref="root" class="scroll-reveal" :class="{ revealed }">
    <slot />
  </div>
</template>

<style scoped>
.scroll-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>
