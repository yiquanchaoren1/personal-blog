import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollSpy() {
  const scrollPercent = ref(0)
  const showBackToTop = ref(false)
  const activeHeadingId = ref('')

  function onScroll() {
    const h = document.documentElement
    const scrollTop = h.scrollTop || window.scrollY
    const scrollHeight = h.scrollHeight - h.clientHeight

    scrollPercent.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
    showBackToTop.value = scrollTop > 300

    // Find the heading closest to the top of viewport
    const headings = document.querySelectorAll('.article-content h2, .article-content h3')
    if (headings.length === 0) {
      activeHeadingId.value = ''
      return
    }

    let closest = null
    let closestTop = Infinity
    headings.forEach((h) => {
      const rect = h.getBoundingClientRect()
      // Heading is above or near the top of viewport
      if (rect.top <= 100 && rect.top > -300) {
        if (Math.abs(rect.top - 100) < closestTop) {
          closestTop = Math.abs(rect.top - 100)
          closest = h
        }
      }
    })
    // If no heading is near the top, take the first one that has passed
    if (!closest) {
      for (const h of headings) {
        const rect = h.getBoundingClientRect()
        if (rect.top < 100) {
          closest = h
        }
      }
    }

    activeHeadingId.value = closest ? closest.id : ''
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { scrollPercent, showBackToTop, activeHeadingId }
}
