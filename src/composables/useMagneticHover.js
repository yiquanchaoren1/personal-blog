/**
 * Lightweight magnetic hover effect.
 * Usage: add `data-magnetic` attribute to any element.
 * The element will subtly shift toward the cursor on hover.
 */
export function useMagneticHover() {
  if (typeof window === 'undefined') return

  function onMouseMove(e) {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    // Map to small translate range
    const tx = (x / rect.width) * 8
    const ty = (y / rect.height) * 8
    el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`
    el.style.transition = 'transform 0.15s ease-out'
  }

  function onMouseLeave(e) {
    const el = e.currentTarget
    el.style.transform = 'translate(0, 0)'
    el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }

  function observe(root) {
    if (!root) return
    const els = root.querySelectorAll('[data-magnetic]')
    els.forEach((el) => {
      el.addEventListener('mousemove', onMouseMove)
      el.addEventListener('mouseleave', onMouseLeave)
    })
  }

  function unobserve(root) {
    if (!root) return
    const els = root.querySelectorAll('[data-magnetic]')
    els.forEach((el) => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
    })
  }

  return { observe, unobserve }
}
