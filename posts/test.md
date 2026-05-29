---

title: test
date: 2026-05-15
tags: [CSS, 布局, 前端]
summary: test1

---



![1780061397703](E:\work\personal-blog\public\images\1780061397703.png)

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

| Grid           | Flexbox        |
| -------------- | -------------- |
| 二维（行+列）  | 一维（行或列） |
| 布局优先       | 内容优先       |
| 适合页面级布局 | 适合组件级排列 |

选择合适的工具能让你的 CSS 代码更加简洁高效。