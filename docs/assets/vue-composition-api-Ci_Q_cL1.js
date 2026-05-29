var e=`---
title: Vue 3 Composition API 入门指南
date: 2026-05-20
tags: [Vue, JavaScript, 前端]
summary: 深入浅出地介绍 Vue 3 Composition API 的核心概念，包括 ref、reactive、computed 和 watch 的使用方法。
---

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
`;export{e as default};