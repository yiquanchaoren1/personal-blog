import { ref, onMounted, onUnmounted } from 'vue'

// Module-level state so all components share the same cursor state
const mouseX = ref(-100)
const mouseY = ref(-100)
const isHovering = ref(false)
const isTouch = ref(false)

let trail = []        // { x, y, r, alpha }
let outerX = -100
let outerY = -100
let rafId = null
let trailTimer = null

function init() {
  if (typeof window === 'undefined') return

  // Detect touch device
  isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouch.value) return

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  document.addEventListener('mouseover', onHoverCheck, true)
  document.addEventListener('mouseout', onHoverCheck, true)
  document.body.style.cursor = 'none'

  // Start animation loop
  rafId = requestAnimationFrame(animate)

  // Trail spawner
  trailTimer = setInterval(() => {
    if (mouseX.value > 0) {
      trail.push({ x: mouseX.value, y: mouseY.value, r: 3, alpha: 0.6 })
    }
    // Limit trail length
    if (trail.length > 60) trail.shift()
  }, 30)
}

function destroy() {
  if (isTouch.value) return
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseover', onHoverCheck, true)
  document.removeEventListener('mouseout', onHoverCheck, true)
  document.body.style.cursor = ''
  if (rafId) cancelAnimationFrame(rafId)
  if (trailTimer) clearInterval(trailTimer)
  trail = []
}

function onMouseMove(e) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
  // Init outer ring on first move
  if (outerX < 0) { outerX = e.clientX; outerY = e.clientY }
}

function onHoverCheck(e) {
  const target = e.target
  const hoverable = target.closest('a, button, .article-card, .skill-tag, .tag, .toc-item a, input, textarea, [data-magnetic]')
  isHovering.value = e.type === 'mouseover' && !!hoverable
}

function animate() {
  // Spring follow for outer ring
  outerX += (mouseX.value - outerX) * 0.12
  outerY += (mouseY.value - outerY) * 0.12

  // Fade trail dots
  for (let i = trail.length - 1; i >= 0; i--) {
    trail[i].r *= 0.94
    trail[i].alpha *= 0.92
    if (trail[i].alpha < 0.01) trail.splice(i, 1)
  }

  rafId = requestAnimationFrame(animate)
}

export function useCustomCursor() {
  onMounted(() => {
    // Only init once (module-level guard)
    if (!isTouch.value && outerX < -50) init()
  })

  onUnmounted(() => {
    // Don't destroy - cursor persists across routes
  })

  return {
    mouseX,
    mouseY,
    outerX: ref(0),   // These are computed from module state in the component
    outerY: ref(0),
    isHovering,
    isTouch,
    trail,
    getOuterX: () => outerX,
    getOuterY: () => outerY,
    getTrail: () => trail,
  }
}

// Auto-init on module load
if (typeof document !== 'undefined') {
  // Defer to let Vue mount first
  setTimeout(() => {
    if (!('ontouchstart' in window)) {
      document.body.style.cursor = 'none'
    }
  }, 100)
}
