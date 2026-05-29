<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isTouch = ref(false)
const mouseX = ref(-100)
const mouseY = ref(-100)
const outerX = ref(-100)
const outerY = ref(-100)
const hovering = ref(false)
const canvasRef = ref(null)

let trail = []
let rafId = null
let trailTimer = null
let ctx = null

onMounted(() => {
  isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouch.value) return

  document.body.style.cursor = 'none'

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  document.addEventListener('mouseover', onHoverCheck, true)
  document.addEventListener('mouseout', onHoverCheck, true)

  // Init canvas
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }

  // Trail spawner
  trailTimer = setInterval(() => {
    if (mouseX.value > 0) {
      trail.push({ x: mouseX.value, y: mouseY.value, r: 3.5, alpha: 0.55 })
      if (trail.length > 80) trail.shift()
    }
  }, 25)

  rafId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (isTouch.value) return
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseover', onHoverCheck, true)
  document.removeEventListener('mouseout', onHoverCheck, true)
  window.removeEventListener('resize', resizeCanvas)
  document.body.style.cursor = ''
  if (rafId) cancelAnimationFrame(rafId)
  if (trailTimer) clearInterval(trailTimer)
})

function resizeCanvas() {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
  }
}

function onMouseMove(e) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
  if (outerX.value < 0) { outerX.value = e.clientX; outerY.value = e.clientY }
}

function onHoverCheck(e) {
  const target = e.target
  const hoverable = target.closest('a, button, .article-card, .skill-tag, .tag, .toc-item a, input, textarea, [data-magnetic], [data-tilt]')
  hovering.value = e.type === 'mouseover' && !!hoverable
}

function animate() {
  // Spring physics for outer ring
  outerX.value += (mouseX.value - outerX.value) * 0.1
  outerY.value += (mouseY.value - outerY.value) * 0.1

  // Fade + shrink trail dots
  for (let i = trail.length - 1; i >= 0; i--) {
    trail[i].r *= 0.93
    trail[i].alpha *= 0.9
    if (trail[i].alpha < 0.008) trail.splice(i, 1)
  }

  // Draw canvas trail
  if (ctx && canvasRef.value) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    for (const dot of trail) {
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, Math.max(0.2, dot.r), 0, Math.PI * 2)
      const c = hovering.value ? '232, 160, 144' : '180, 180, 180'  // accent vs gray
      ctx.fillStyle = `rgba(${c},${dot.alpha})`
      ctx.fill()
    }
  }

  rafId = requestAnimationFrame(animate)
}
</script>

<template>
  <div v-if="!isTouch" class="custom-cursor">
    <!-- Trail canvas -->
    <canvas ref="canvasRef" class="cursor-canvas"></canvas>
    <!-- Outer ring (spring-follow) -->
    <div
      class="cursor-ring"
      :class="{ hovering }"
      :style="{ left: outerX + 'px', top: outerY + 'px' }"
    ></div>
    <!-- Inner dot -->
    <div
      class="cursor-dot"
      :class="{ hovering }"
      :style="{ left: mouseX + 'px', top: mouseY + 'px' }"
    ></div>
  </div>
</template>

<style scoped>
.cursor-canvas {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
}

.cursor-dot,
.cursor-ring {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  will-change: left, top;
}

.cursor-dot {
  width: 6px;
  height: 6px;
  background: var(--accent);
  transition: width 0.2s, height 0.2s, background 0.2s;
}

.cursor-dot.hovering {
  width: 10px;
  height: 10px;
  background: var(--accent-hover);
  mix-blend-mode: difference;
}

.cursor-ring {
  width: 28px;
  height: 28px;
  border: 1.5px solid rgba(180, 180, 180, 0.5);
  transition: width 0.2s, height 0.2s, border-color 0.2s, border-width 0.2s;
}

.cursor-ring.hovering {
  width: 48px;
  height: 48px;
  border-color: var(--accent);
  border-width: 2px;
}
</style>
