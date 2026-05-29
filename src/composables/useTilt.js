/**
 * 3D card tilt effect.
 * Usage: add `data-tilt` attribute to any card element.
 * The card will rotate in 3D space following the cursor position.
 */
export function useTilt() {
  if (typeof window === 'undefined') return

  function onMouseMove(e) {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5

    el.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg)`
    el.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease'

    // Move the glare layer
    const glare = el.querySelector('.card-glare')
    if (glare) {
      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`
      glare.style.opacity = '1'
    }
  }

  function onMouseLeave(e) {
    const el = e.currentTarget
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)'
    el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease'

    const glare = el.querySelector('.card-glare')
    if (glare) {
      glare.style.opacity = '0'
      glare.style.transition = 'opacity 0.4s ease'
    }
  }

  function observe(root) {
    if (!root) return
    const els = root.querySelectorAll('[data-tilt]')
    els.forEach((el) => {
      el.addEventListener('mousemove', onMouseMove)
      el.addEventListener('mouseleave', onMouseLeave)
      // Add glare layer if not present
      if (!el.querySelector('.card-glare')) {
        const glare = document.createElement('div')
        glare.className = 'card-glare'
        glare.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;border-radius:inherit;opacity:0;'
        el.style.position = el.style.position || 'relative'
        el.style.overflow = 'hidden'
        el.appendChild(glare)
      }
    })
  }

  function unobserve(root) {
    if (!root) return
    const els = root.querySelectorAll('[data-tilt]')
    els.forEach((el) => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
    })
  }

  return { observe, unobserve }
}
