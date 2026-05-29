---
title: 使用 Vite 优化前端开发体验
date: 2026-05-10
tags: [Vite, 工具, 前端]
summary: 介绍 Vite 的核心特性——极速冷启动、HMR 热更新和开箱即用的 TypeScript 支持。
---

## 什么是 Vite？

Vite 是一个现代化前端构建工具，由 Vue 的作者尤雨溪开发。它利用浏览器原生 ES 模块支持，实现了极速的开发服务器启动和热更新。

### 核心优势

1. **极速冷启动**：使用 esbuild 预构建依赖，比传统打包工具快数十倍
2. **HMR 热更新**：模块级别的热替换，无论项目多大都保持快速
3. **开箱即用**：支持 TypeScript、CSS 预处理器、JSX 等

### 创建项目

```bash
npm create vite@latest my-app -- --template vue
```

### 配置代理

```js
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
}
```

Vite 已经成为 Vue 生态的标配工具，也支持 React、Svelte 等其他框架，是新一代前端工具链的优秀代表。
