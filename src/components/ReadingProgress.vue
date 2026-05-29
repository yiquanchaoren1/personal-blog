<script setup>
import { useScrollSpy } from '../composables/useScrollSpy.js'

const { scrollPercent } = useScrollSpy()
</script>

<template>
  <div class="reading-progress" :style="{ width: scrollPercent + '%' }"></div>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-hover));
  z-index: 200;
  transition: width 0.1s linear;
  border-radius: 0 2px 0 0;
}
</style>
