import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'blog-theme'

function getInitial() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored === 'dark'
  } catch (e) { /* blocked */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitial())

function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

// Apply immediately on script load (avoids FOUC)
applyTheme(isDark.value)

watchEffect(() => {
  const val = isDark.value
  try { localStorage.setItem(STORAGE_KEY, val ? 'dark' : 'light') } catch (e) { /* blocked */ }
  applyTheme(val)
})

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleTheme }
}
