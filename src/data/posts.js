export const posts = [
  {
    id: 1,
    title: 'Vue 3 Composition API 入门指南',
    date: '2026-05-20',
    summary: '深入浅出地介绍 Vue 3 Composition API 的核心概念，包括 ref、reactive、computed 和 watch 的使用方法。',
    tags: ['Vue', 'JavaScript', '前端'],
    content: `
## 为什么选择 Composition API？

Vue 3 引入的 Composition API 提供了一种更灵活的方式来组织组件逻辑。与 Options API 相比，它让我们能够按照**功能关注点**而非**选项类型**来组织代码。

### setup 函数

\`\`\`js
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)

    function increment() {
      count.value++
    }

    return { count, doubled, increment }
  }
}
\`\`\`

### ref vs reactive

- \`ref\` 用于包装基本类型值，通过 \`.value\` 访问
- \`reactive\` 用于包装对象，直接访问属性

### watch 和 watchEffect

\`watch\` 需要明确指定监听源，而 \`watchEffect\` 会自动追踪其回调中使用的所有响应式依赖。

\`\`\`js
import { ref, watch, watchEffect } from 'vue'

const keyword = ref('')

// watch：明确监听 keyword
watch(keyword, (newVal) => {
  console.log('搜索:', newVal)
})

// watchEffect：自动追踪依赖
watchEffect(() => {
  console.log('当前关键词:', keyword.value)
})
\`\`\`

Composition API 最大的优势在于**逻辑复用**——你可以轻松地将相关逻辑提取到自定义 composable 函数中，在不同组件间共享。
    `.trim(),
  },
  {
    id: 2,
    title: 'CSS Grid 布局实战技巧',
    date: '2026-05-15',
    summary: '分享几个 CSS Grid 布局的实用技巧，包括响应式网格、圣杯布局和嵌套网格的实际应用场景。',
    tags: ['CSS', '布局', '前端'],
    content: `
## CSS Grid 基础

CSS Grid 是二维布局系统，可以同时处理行和列，非常适合构建复杂的页面布局。

### 基础网格

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\`

### 响应式网格

使用 \`auto-fit\` 和 \`minmax\` 可以创建无需媒体查询的响应式网格：

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
\`\`\`

### 圣杯布局

\`\`\`css
.layout {
  display: grid;
  grid-template:
    "header  header  header"  auto
    "nav     main    aside"  1fr
    "footer  footer  footer" auto
    / 200px   1fr     200px;
  min-height: 100vh;
}
\`\`\`

### Grid vs Flexbox

| Grid | Flexbox |
|------|---------|
| 二维（行+列） | 一维（行或列） |
| 布局优先 | 内容优先 |
| 适合页面级布局 | 适合组件级排列 |

选择合适的工具能让你的 CSS 代码更加简洁高效。
    `.trim(),
  },
  {
    id: 3,
    title: '使用 Vite 优化前端开发体验',
    date: '2026-05-10',
    summary: '介绍 Vite 的核心特性——极速冷启动、HMR 热更新和开箱即用的 TypeScript 支持。',
    tags: ['Vite', '工具', '前端'],
    content: `
## 什么是 Vite？

Vite 是一个现代化前端构建工具，由 Vue 的作者尤雨溪开发。它利用浏览器原生 ES 模块支持，实现了极速的开发服务器启动和热更新。

### 核心优势

1. **极速冷启动**：使用 esbuild 预构建依赖，比传统打包工具快数十倍
2. **HMR 热更新**：模块级别的热替换，无论项目多大都保持快速
3. **开箱即用**：支持 TypeScript、CSS 预处理器、JSX 等

### 创建项目

\`\`\`bash
npm create vite@latest my-app -- --template vue
\`\`\`

### 配置代理

\`\`\`js
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
}
\`\`\`

Vite 已经成为 Vue 生态的标配工具，也支持 React、Svelte 等其他框架，是新一代前端工具链的优秀代表。
    `.trim(),
  },
]

export const skills = [
  'Vue.js', 'React', 'TypeScript', 'JavaScript',
  'Node.js', 'Python', 'CSS/SCSS', 'Tailwind',
  'Git', 'Docker', 'MySQL', 'Linux',
]
