---
title: CSS Grid 布局实战技巧
date: 2026-05-15
tags: [CSS, 布局, 前端]
summary: 分享几个 CSS Grid 布局的实用技巧，包括响应式网格、圣杯布局和嵌套网格的实际应用场景。
---

## CSS Grid 基础

CSS Grid 是二维布局系统，可以同时处理行和列，非常适合构建复杂的页面布局。

### 基础网格

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

### 响应式网格

使用 `auto-fit` 和 `minmax` 可以创建无需媒体查询的响应式网格：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

### 圣杯布局

```css
.layout {
  display: grid;
  grid-template:
    "header  header  header"  auto
    "nav     main    aside"  1fr
    "footer  footer  footer" auto
    / 200px   1fr     200px;
  min-height: 100vh;
}
```

### Grid vs Flexbox

| Grid | Flexbox |
|------|---------|
| 二维（行+列） | 一维（行或列） |
| 布局优先 | 内容优先 |
| 适合页面级布局 | 适合组件级排列 |

选择合适的工具能让你的 CSS 代码更加简洁高效。
