import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/blog', name: 'Blog', component: () => import('../views/Blog.vue') },
  { path: '/blog/:id', name: 'Post', component: () => import('../views/Post.vue') },
  { path: '/crypto', name: 'Crypto', component: () => import('../views/Crypto.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
