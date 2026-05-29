var e=`---
title: Claude Code 从入门到精通 — 全面知识体系
date: 2026-05-29
tags: [Claude Code, AI, 开发工具, 效率]
summary: 覆盖 Claude Code 全部核心知识点：对话编程、Plan Mode、Memory、Hooks、Agent、Skills、Workflows，从基础到架构师思维的完整学习路线。
---

## 一、什么是 Claude Code

Claude Code 是 Anthropic 推出的命令行 AI 编程助手。它不是简单的代码补全工具，而是一个能**读代码、写代码、搜索文件、执行命令、管理 Git、编排多代理**的完整软件工程环境。

核心能力一句话概括：**用自然语言驱动整个软件开发生命周期。**

---

## 二、基础篇

### 2.1 启动与退出

\`\`\`bash
# 在项目目录下启动
cd your-project
claude

# 退出
/exit
# 或 Ctrl+C / Ctrl+D
\`\`\`

### 2.2 核心交互模式

Claude Code 不仅能聊天，它能实际**操作你的文件系统和执行命令**：

| 能力 | 示例 |
|------|------|
| 读文件 | "读取 src/App.vue" |
| 搜索代码 | "搜索所有用到 localStorage 的地方" |
| 写文件 | "在 src/components/ 下创建一个 Hello.vue 组件" |
| 改代码 | "把页脚年份改成 2026" |
| 执行命令 | "运行 npm install" |
| Git 操作 | "提交并推送到 main 分支" |

### 2.3 内置斜杠命令

在对话中直接输入：

| 命令 | 用途 |
|------|------|
| \`/help\` | 查看帮助 |
| \`/clear\` | 清空上下文，开始全新对话 |
| \`/compact\` | 压缩长对话历史 |
| \`/status\` | 查看当前项目状态 |
| \`/doctor\` | 诊断安装问题 |
| \`/upgrade\` | 升级到最新版本 |
| \`/memory\` | 查看/管理持久记忆 |
| \`/tasks\` | 查看后台任务 |
| \`/hooks\` | 管理自动化钩子 |
| \`/workflows\` | 查看工作流运行状态 |

---

## 三、上下文管理

Claude 的"记忆"有上限（上下文窗口）。长对话需要主动管理：

### 3.1 三个核心操作

| 操作 | 效果 | 何时使用 |
|------|------|---------|
| \`/compact\` | 压缩对话历史，保留关键信息 | 对话很长时 |
| \`/clear\` | 完全清空，重新开始 | 切换到全新任务 |
| \`CLAUDE.md\` | 每次会话自动加载项目说明书 | 必有，放在项目根目录 |

### 3.2 CLAUDE.md 示例

在项目根目录创建 \`CLAUDE.md\`：
\`\`\`markdown
# 项目说明
- Vue 3 + Vite 前端项目
- 使用 hash 路由（createWebHashHistory）
- 部署到 GitHub Pages
- npm run build 构建到 docs/ 目录
- 在中国，访问 GitHub 需要代理 127.0.0.1:7897
\`\`\`

每次新会话，Claude 会自动读取这个文件，无需重复说明。

---

## 四、权限与安全

### 4.1 权限模式

| 模式 | 行为 |
|------|------|
| \`default\` | 敏感操作需要确认 |
| \`acceptEdits\` | 自动接受文件编辑 |
| \`plan\` | 只读模式，先设计再实施 |
| \`dontAsk\` | 自动执行，不询问 |
| \`bypassPermissions\` | 跳过所有权限检查 |

### 4.2 权限规则配置

在 \`.claude/settings.local.json\` 中：

\`\`\`json
{
  "permissions": {
    "allow": ["Bash(npm *)", "Bash(git *)", "Bash(npx *)"],
    "deny": ["Bash(rm -rf *)", "Bash(sudo *)"],
    "ask": ["Write(/etc/*)"]
  }
}
\`\`\`

- \`allow\` — 白名单，免确认
- \`deny\` — 黑名单，硬阻止
- \`ask\` — 每次都询问

---

## 五、Plan Mode（计划模式）

**这是从"能用"到"精通"的分水岭。**

### 5.1 工作原理

1. 你提出一个复杂任务
2. Claude **只读探索**代码库，设计架构方案
3. 你把关审阅，可以修改、拒绝
4. 批准后 Claude 才开始写代码

### 5.2 什么时候必须用 Plan Mode

- 涉及 3 个以上文件
- 新增功能/组件
- 架构变更
- 需要做出技术选型
- 需求不够明确

### 5.3 最佳实践

\`\`\`
好的触发方式：
  "我想给博客加搜索功能，支持标题和全文搜索"
  → 自动进入 Plan Mode

差的触发方式：
  "把第 42 行颜色改成红色"
  → 不需要 Plan，直接改
\`\`\`

---

## 六、Memory（持久记忆）

### 6.1 概念

Memory 让 Claude 跨会话记住你的偏好。存在 \`~/.claude/projects/<项目>/memory/\` 下。

### 6.2 使用方式

\`\`\`
"记住：我的 GitHub 用户名是 yiquanchaoren1"
"记住：这个项目用 npm run build 构建到 docs/"
"记住：我偏好 Vue 3 Composition API，不需要 Options API"
\`\`\`

下次新会话，Claude 自动加载这些记忆。

### 6.3 管理记忆

\`\`\`
/memory              — 查看所有记忆
"更新关于代理的记忆"  — 修改已有记忆
"删除关于 xxx 的记忆" — 删除不需要的记忆
\`\`\`

---

## 七、Hooks（自动化钩子）

**Hooks 是 Claude Code 自动化能力的核心。**

### 7.1 概念

在特定事件发生时自动执行命令。事件包括：

| 事件 | 触发时机 |
|------|---------|
| \`PreToolUse\` | 工具执行前 |
| \`PostToolUse\` | 工具执行成功后 |
| \`SessionStart\` | 会话开始时 |
| \`Stop\` | 会话结束时 |
| \`PreCompact\` | 压缩上下文前 |
| \`UserPromptSubmit\` | 用户提交消息时 |
| \`Notification\` | 收到通知时 |

### 7.2 实战示例

**自动构建：修改源文件后自动 \`npm run build\`**
\`\`\`json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "cd e:/work/personal-blog && npm run build"
      }]
    }]
  }
}
\`\`\`

**自动设置代理：每次会话开始**
\`\`\`json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "git config http.proxy http://127.0.0.1:7897"
      }]
    }]
  }
}
\`\`\`

**自动压缩通知：压缩前提醒**
\`\`\`json
{
  "hooks": {
    "PreCompact": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo '{\\"systemMessage\\": \\"上下文即将压缩\\"}'"
      }]
    }]
  }
}
\`\`\`

### 7.3 Matcher 语法

| Matcher | 匹配 |
|---------|------|
| \`Write\` | 所有 Write 操作 |
| \`Write\\|Edit\` | Write 或 Edit |
| \`Bash(git *)\` | 以 git 开头的 Bash 命令 |
| \`Bash(npm *)\` | 以 npm 开头的 Bash 命令 |

---

## 八、Agent（子代理）

### 8.1 概念

Agent 是有独立上下文的子任务执行者。适合并行处理。

### 8.2 使用场景

\`\`\`
✅ 适合 Agent：
  - 并行搜索多个目录
  - 代码审查（多个维度同时检查）
  - 独立文件的并行修改

❌ 不适合 Agent：
  - 需要串行依赖的任务
  - 需要共享大量上下文的任务
\`\`\`

### 8.3 Agent 类型

| 类型 | 用途 |
|------|------|
| \`general-purpose\` | 通用任务（默认） |
| \`Explore\` | 只读搜索 |
| \`Plan\` | 架构设计 |
| \`claude-code-guide\` | Claude Code 自身问题 |

---

## 九、Skills（自定义技能）

### 9.1 概念

将常用工作流封装为可复用的技能文件，放在 \`.claude/skills/\` 目录下。

### 9.2 创建 Skill

\`.claude/skills/deploy.md\`：
\`\`\`markdown
# Deploy Blog Skill

当用户说"部署"或"deploy"时，执行以下步骤：
1. cd e:/work/personal-blog
2. npm run build（确认构建成功）
3. git add -A
4. git commit -m "用户提供的提交信息"
5. git push origin main
6. 告知用户部署完成，等 1-2 分钟后可访问
\`\`\`

### 9.3 触发方式

\`\`\`
"部署"                    → 自动匹配 deploy skill
"deploy with message '修复bug'"  → 带参数触发
\`\`\`

---

## 十、Workflows（多代理编排）

### 10.1 概念

像写程序一样编排多个 Agent 的协作——并行、流水线、循环。

### 10.2 核心模式

**pipeline（流水线）— 默认选择：**
\`\`\`
items → Stage A → Stage B → Stage C
每个 item 独立流过所有 stage，互不等待
\`\`\`

**parallel（并行屏障）— 只在需要汇总时使用：**
\`\`\`
[Agent1, Agent2, Agent3] → 等待全部完成 → 汇总
\`\`\`

### 10.3 适用场景

\`\`\`
✅ 用 Workflow：
  - 大规模代码审查（多维度并行检查）
  - 批量迁移（每个文件一个 Agent）
  - 全面测试

❌ 用 Plan Mode：
  - 普通功能开发
  - 小范围修改
\`\`\`

---

## 十一、精通路线图

\`\`\`
Week 1  ██ 基础：对话编程 + 搜索 + 文件操作
Week 2  ██ 核心：Plan Mode + Memory
Week 3  ██ 自动：Hooks 配置
Week 4  ██ 并行：Agent + Skills
Week 5  ██ 编排：Workflows
Week 6+ ██ 架构师思维：组合所有能力
\`\`\`

---

## 十二、常见问题

**Q: Claude 改错了我怎么回退？**
A: 用 Git 回退。Claude 的每次修改都会 commit（如果开启了）。

**Q: 上下文不够怎么办？**
A: 用 \`/compact\` 压缩，或 \`/clear\` 重置。关键信息写入 \`CLAUDE.md\`。

**Q: 怎么让 Claude 更快？**
A: 使用 \`/fast\` 开启快速模式，或在设置中配置 \`fastMode: true\`。

**Q: 可以在多个项目中使用吗？**
A: 可以。每个项目的 Memory 是独立的，互不干扰。

**Q: 离线和在线有什么区别？**
A: Claude Code 需要网络连接。断网时无法使用。

---

> 本文涵盖 Claude Code 从入门到精通的所有关键知识点，建议配合实践逐层掌握。
`;export{e as default};