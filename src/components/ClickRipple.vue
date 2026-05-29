<script setup>
import { onMounted, onUnmounted } from 'vue'

const ripples = []

function createRipple(e) {
  // Only for left clicks
  if (e.button !== 0) return

  const ripple = document.createElement('span')
  ripple.className = 'click-ripple'
  const size = 40
  ripple.style.cssText = `
    left: ${e.clientX - size / 2}px;
    top: ${e.clientY - size / 2}px;
    width: ${size}px;
    height: ${size}px;
  `
  document.body.appendChild(ripple)
  ripples.push(ripple)

  // Cleanup after animation
  ripple.addEventListener('animationend', () => {
    ripple.remove()
    const idx = ripples.indexOf(ripple)
    if (idx > -1) ripples.splice(idx, 1)
  })
}

onMounted(() => {
  document.addEventListener('click', createRipple, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', createRipple)
  ripples.forEach(r => r.remove())
})
</script>

<template>
  <div style="display:none"><!-- Invisible wrapper, logic runs via document events --></div>
</template>
