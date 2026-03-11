<p align="center">
  <h1 align="center">🦞 OpenClaw AI Agent Workspace</h1>
  <p align="center">
    <strong>Next-Generation AI Agent Development Environment</strong>
  </p>
</p>

<p align="center">
  <a href="https://github.com/pangxianggang/openclaw-workspace/stargazers">
    <img src="https://img.shields.io/github/stars/pangxianggang/openclaw-workspace?style=for-the-badge&logo=github&color=ffd700" alt="Stars">
  </a>
  <a href="https://github.com/pangxianggang/openclaw-workspace/network/members">
    <img src="https://img.shields.io/github/forks/pangxianggang/openclaw-workspace?style=for-the-badge&logo=github&color=blue" alt="Forks">
  </a>
  <a href="https://github.com/pangxianggang/openclaw-workspace/issues">
    <img src="https://img.shields.io/github/issues/pangxianggang/openclaw-workspace?style=for-the-badge&logo=github&color=ff6b6b" alt="Issues">
  </a>
  <a href="https://github.com/pangxianggang/openclaw-workspace/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/pangxianggang/openclaw-workspace?style=for-the-badge&logo=github&color=4ecdc4" alt="License">
  </a>
  <br>
  <a href="https://github.com/pangxianggang">
    <img src="https://img.shields.io/badge/Author-庞祥刚-blue?style=for-the-badge&logo=github" alt="Author">
  </a>
  <a href="https://python.org">
    <img src="https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  </a>
  <a href="https://github.com/openclaw/openclaw">
    <img src="https://img.shields.io/badge/OpenClaw-3.2-2ea44f?style=for-the-badge&logo=github" alt="OpenClaw">
  </a>
</p>

---

## 🌊 项目概览

> **OpenClaw AI Agent Workspace** 是一个功能完整的 AI 智能体开发环境，集成了多层记忆系统、技能模块、自动化工作流和 15+ AI 模型支持。

<div align="center">

| 🎯 核心能力 | 🛠️ 技术栈 | 🚀 特色功能 |
|------------|----------|------------|
| 多层记忆系统 | FastAPI + Qdrant + Ollama | 事务支持 |
| 15+ AI 模型 | Python 3.14 + TypeScript | 操作日志 |
| 技能生态系统 | Docker + Git + Linux | 流式处理 |
| 自动化工作流 | PostgreSQL + Redis | 批量操作 |

</div>

---

## ✨ 核心特性

### 🧠 记忆系统 (Memory Bank)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Ollama        │     │   Qdrant        │     │  Memory Bank    │
│  端口 11434     │◄───►│  端口 6333      │◄───►│  端口 8100      │
│  LLM + 嵌入     │     │  向量数据库      │     │  FastAPI 服务    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

| 功能 | 说明 | 状态 |
|------|------|------|
| 候选经验池 | 新经验默认 candidate，第 3 次正反馈后转正 | ✅ |
| 多信号置信度 | 反馈驱动置信度：0.50 → 0.64 → 0.92 | ✅ |
| 成功率排序 | 按采纳成功率排序，支持 include_candidates | ✅ |

### 🔧 火星文件管理 V2

| 功能 | V1 | V2 | 提升 |
|------|----|----|----|
| 事务支持 | ❌ | ✅ | 🔥 版本校验/回滚 |
| 操作日志 | ❌ | ✅ | ⭐ 完整审计追踪 |
| 大文件流式 | ❌ | ✅ | ⭐ 1.8M 行/秒 |
| 批量操作 | ❌ | ✅ | ⭐ 多线程加速 |
| 异步支持 | ❌ | ✅ | ⭐ async/await |

**性能指标**:
```
✅ 流式读取：1,544,920 行/秒
✅ 批量创建：2,491 文件/秒
✅ 批量编辑：500 文件/秒
✅ 异步并发：15 文件/<0.01 秒
```

### 🤖 AI 模型支持 (15+)

#### 阿里云 DashScope (5 个)
| 模型 | 上下文 | 特点 | 推荐场景 |
|------|--------|------|----------|
| **Qwen3.5-Plus** ⭐ | 1M | 主力模型 | 通用对话 |
| **Qwen3-Max** 🚀 | 262K | 最强版本 | 复杂任务 |
| **Qwen3-Coder-Next** 💻 | 262K | 代码优化 | 编程任务 |
| **Qwen3-Coder-Plus** 💻 | 1M | 代码增强 | 大型项目 |
| **MiniMax-M2.5** 🎯 | 196K | 多模态 | 图文处理 |

#### 智普 AI (4 个)
| 模型 | 上下文 | 特点 |
|------|--------|------|
| **GLM-5** 🧠 | 202K | 通用主力 |
| **GLM-4.7** 📊 | 202K | 平衡版本 |
| **GLM-4-Air** ⚖️ | 202K | 性能平衡 |
| **GLM-4-Flash** ⚡ | 202K | 最快响应 |

#### 其他模型 (6 个)
| 模型 | 提供商 | 特点 |
|------|--------|------|
| **Kimi-K2.5** 🌙 | Moonshot | 长文本专家 |
| **DeepSeek-Chat** 💬 | DeepSeek | 对话优化 |
| **DeepSeek-Coder** 💻 | DeepSeek | 编程专用 |
| **DeepSeek-V3** 🚀 | DeepSeek | 最新版本 |
| **Pony-Alpha-2** 🐴 | 智普 | 代码专用 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  OpenClaw   │  │  AutoClaw   │  │   Web UI    │             │
│  │  Port:18789 │  │  Port:18790 │  │   Browser   │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────┐
│                      Gateway Layer                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              OpenClaw Gateway (Main)                     │  │
│  │         Token: 963cfdcebfa715af5e0d08e5d58c55f247...    │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────┬────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
┌─────────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│  Mars File     │ │   Memory    │ │   Skills    │
│  Manager V2    │ │    Bank     │ │   System    │
│  - Transaction │ │  - FastAPI  │ │  - 50+      │
│  - Logging     │ │  - Qdrant   │ │    Skills   │
│  - Streaming   │ │  - Ollama   │ │             │
└────────────────┘ └─────────────┘ └─────────────┘
```

---

## 📁 项目结构

```
openclaw-workspace/
├── .openclaw/                    # OpenClaw 配置
│   ├── openclaw.json            # 主配置文件
│   └── workspace/               # 工作区文件
├── .openclaw-autoclaw/          # AutoClaw 独立配置
│   ├── openclaw.json            # AutoClaw 配置
│   └── sessions/                # 独立会话存储
├── memory/                      # 记忆系统
│   ├── YYYY-MM-DD.md           # 每日记忆
│   └── MEMORY.md               # 长期记忆
├── skills/                      # 技能模块
│   ├── fm-engine/              # 火星文件管理
│   ├── autoglm-*               # AutoGLM 系列
│   └── ...                     # 50+ 技能
├── AGENTS.md                    # AI 助手配置
├── SOUL.md                      # AI 人格定义
├── USER.md                      # 用户信息
├── TOOLS.md                     # 工具文档
├── HEARTBEAT.md                 # 心跳机制
├── IDENTITY.md                  # 身份定义
└── README.md                    # 本文件
```

---

## 🚀 快速开始

### 1️⃣ 环境准备

```bash
# 安装依赖
pip install fastapi uvicorn qdrant-client ollama

# 启动服务
docker start qdrant
docker start ollama
python main.py  # Memory Bank
```

### 2️⃣ 使用火星文件管理

```python
from fm_engine_v2 import FileEngineV2

# 初始化引擎
engine = FileEngineV2(
    r"C:\Users\Administrator\Desktop",
    log_file="ops.log"
)

# 启用事务
engine.txn._check_all_files = True

# 使用事务
with engine.txn.transaction():
    engine.edit("file.txt", line=1, content="新内容\n")
```

### 3️⃣ 使用记忆系统

```python
import requests

# 保存经验
requests.post('http://localhost:8100/experience/write', json={
    'topic': '主题',
    'lesson': '经验内容',
    'type': 'lesson',
    'tags': ['标签']
})

# 搜索记忆
requests.post('http://localhost:8100/memory/search', json={
    'query': '搜索内容',
    'limit': 5
})
```

### 4️⃣ 切换 AI 模型

```python
# OpenClaw (默认 Qwen3.5-Plus)
# AutoClaw (默认 Pony-Alpha-2)

# 在对话中直接指定：
"切换到 Qwen3-Max 模型"
"使用 glm-5 帮我写代码"
```

---

## 📊 端口配置

| 服务 | 端口 | 状态 | 说明 |
|------|------|------|------|
| OpenClaw Gateway | 18789 | ✅ | 主力助手 |
| AutoClaw Gateway | 18790 | ✅ | 智普客户端 |
| Memory Bank API | 8100 | ✅ | 记忆服务 |
| Qdrant DB | 6333 | ✅ | 向量数据库 |
| Ollama | 11434 | ✅ | 本地 LLM |

---

## 🎯 使用场景

### 日常对话
```
"你好阿里" → 使用 Qwen3.5-Plus
```

### 编程任务
```
"用 Qwen3-Coder-Plus 帮我写个 FastAPI 接口"
```

### 文件操作
```
"用火星文件管理系统在桌面创建测试文件"
```

### 记忆查询
```
"搜索关于 Python API 的记忆"
```

### 批量操作
```
"批量给所有 Python 文件添加头部注释"
```

---

## 🏆 成就与统计

### 已完成
- ✅ AutoClaw 连接问题修复
- ✅ 火星文件管理 V2 发布
- ✅ 记忆大脑系统上线
- ✅ 15 个 AI 模型配置
- ✅ 会话隔离实现
- ✅ 50+ 技能模块

### 技术栈统计
```
Python      ████████████████████  68.9%
Shell       ████                  14.7%
JavaScript  ████                  14.3%
TypeScript  ▏                     1.1%
Batchfile   ▏                     1.0%
```

---

## 📅 开发时间线

| 日期 | 事件 |
|------|------|
| 2026-03-12 | OpenClaw Workspace 仓库创建 |
| 2026-03-11 | AutoClaw 配置完成，Gateway 冲突解决 |
| 2026-03-11 | 火星文件管理 V2 正式上线 |
| 2026-03-11 | 记忆大脑系统集成完成 |
| 2026-03-10 | MCP 服务器集成完成 |
| 2026-03-09 | Memory Bank 三大新功能上线 |

---

## 👨‍💻 关于作者

<div align="center">

**庞祥刚 (Pang Xianggang)**

[![GitHub](https://img.shields.io/badge/GitHub-pangxianggang-181717?style=for-the-badge&logo=github)](https://github.com/pangxianggang)
[![Email](https://img.shields.io/badge/Email-pangxianggang@outlook.com-D14836?style=for-the-badge&logo=microsoft-outlook)](mailto:pangxianggang@outlook.com)

| 📍 位置 | 🌐 角色 | 🦞 昵称 |
|--------|--------|--------|
| 深圳，中国 | 全栈开发 & AI 爱好者 | 阿里 (Ali) |

**技能栈**:
```
Python, JavaScript, TypeScript, React, Next.js, Vue, Node.js
FastAPI, Flask, Docker, Git, Linux, Nginx, CI/CD
PostgreSQL, MySQL, Redis, Qdrant, SQLite
Ollama, LangChain, RAG, LLM Fine-tuning
```

</div>

---

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**🦞 Powered by curiosity, driven by code**

[⬆ 返回顶部](#-openclaw-ai-agent-workspace)

</div>
