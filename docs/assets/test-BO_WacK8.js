var e=`---\r
\r
title: test\r
date: 2026-05-15\r
tags: [CSS, 布局, 前端]\r
summary: test1\r
\r
---\r
\r
\r
\r
### ![1780061002705](C:\\Users\\Lemon tree\\AppData\\Roaming\\Typora\\typora-user-images\\1780061002705.png)\r
\r
\r
\r
![1780061016472](C:\\Users\\Lemon tree\\AppData\\Roaming\\Typora\\typora-user-images\\1780061016472.png)、\r
\r
\r
\r
\`\`\`css\r
.layout {\r
  display: grid;\r
  grid-template:\r
    "header  header  header"  auto\r
    "nav     main    aside"  1fr\r
    "footer  footer  footer" auto\r
    / 200px   1fr     200px;\r
  min-height: 100vh;\r
}\r
\`\`\`\r
\r
### Grid vs Flexbox\r
\r
| Grid           | Flexbox        |\r
| -------------- | -------------- |\r
| 二维（行+列）  | 一维（行或列） |\r
| 布局优先       | 内容优先       |\r
| 适合页面级布局 | 适合组件级排列 |\r
\r
选择合适的工具能让你的 CSS 代码更加简洁高效。`;export{e as default};