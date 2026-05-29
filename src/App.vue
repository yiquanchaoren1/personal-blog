<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
</script>

<template>
  <div class="scanlines"></div>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">Lemon</router-link>
      <button class="menu-btn" @click="menuOpen = !menuOpen">[=]</button>
      <ul class="navbar-links" :class="{ open: menuOpen }">
        <li><router-link to="/" @click="menuOpen = false">Home</router-link></li>
        <li><router-link to="/blog" @click="menuOpen = false">Blog</router-link></li>
        <li><router-link to="/crypto" @click="menuOpen = false">Crypto</router-link></li>
      </ul>
    </div>
  </nav>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <footer class="footer">
    <p>// &copy; 2026 LEMON.BLOG // STATUS: ONLINE</p>
  </footer>
</template>
