<script setup>
import { ref } from 'vue'
import { useTheme } from './composables/useTheme.js'
import ThemeToggle from './components/ThemeToggle.vue'
import CustomCursor from './components/CustomCursor.vue'
import ClickRipple from './components/ClickRipple.vue'

// Initialize theme
useTheme()

const menuOpen = ref(false)
</script>

<template>
  <CustomCursor />
  <ClickRipple />

  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">Lemon<span class="typing-cursor">|</span></router-link>
      <div style="display:flex;align-items:center;gap:0.5rem">
        <ThemeToggle />
        <button class="menu-btn" @click="menuOpen = !menuOpen">&#9776;</button>
      </div>
      <ul class="navbar-links" :class="{ open: menuOpen }">
        <li><router-link to="/" @click="menuOpen = false">Home</router-link></li>
        <li><router-link to="/blog" @click="menuOpen = false">Blog</router-link></li>
        <li><router-link to="/crypto" @click="menuOpen = false">Crypto</router-link></li>
      </ul>
    </div>
  </nav>

  <router-view />

  <footer class="footer">
    <p>&copy; 2026 Lemon Blog</p>
  </footer>
</template>

<style>
.typing-cursor {
  color: var(--accent);
  font-weight: 400;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
