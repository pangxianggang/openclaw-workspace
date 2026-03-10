# 🦞 OpenClaw Workspace

> 我的 AI 助手工作区 — 基于 OpenClaw 平台的智能 Agent 配置与记忆系统

## 📖 简介

这是一个 OpenClaw AI 助手的完整工作区，包含 Agent 的身份定义、行为规范、记忆系统、技能配置和训练计划。

**技术栈：** Python · Shell · JavaScript · TypeScript · Ollama

## 📂 项目结构

```
openclaw-workspace/
├── 📁 .clawhub/          # ClawHub 技能市场配置
├── 📁 .openclaw/         # OpenClaw 平台配置
├── 📁 ai-discuss-platform/ # AI 讨论平台
├── 📁 memory/            # 记忆存储（每日记录 + 长期记忆）
├── 📁 reports/           # 报告输出
├── 📁 skills/            # Agent 技能模块
├── 📄 AGENTS.md          # Agent 行为规范
├── 📄 SOUL.md            # Agent 灵魂定义（性格、边界、风格）
├── 📄 IDENTITY.md        # Agent 身份信息
├── 📄 USER.md            # 用户画像与偏好
├── 📄 MEMORY.md          # 长期记忆（经验、教训、配置）
├── 📄 HEARTBEAT.md       # 心跳任务配置
├── 📄 TOOLS.md           # 工具使用笔记
├── 📄 Modelfile          # Ollama 模型配置
├── 📄 AI-TRAINING-PLAN.md       # AI 训练计划
├── 📄 AI-ACTION-GUIDE.md        # AI 行动指南
├── 📄 MAXIMIZE-AI.md            # AI 能力最大化
├── 📄 TOOL-COMBOS-TRAINING.md   # 工具组合训练
├── 📄 TOOLS-GUIDE.md            # 工具使用指南
├── 📄 CHEATSHEET.md             # 速查手册
└── 📄 TRAINING-*.md             # 训练相关文档
```

## 🧠 核心模块

| 模块 | 文件 | 说明 |
|------|------|------|
| **身份** | IDENTITY.md | Agent 名称、角色、职责 |
| **灵魂** | SOUL.md | 性格、语言规范、命令执行纪律 |
| **记忆** | MEMORY.md | 长期记忆（配置、教训、经验） |
| **规范** | AGENTS.md | 行为准则、安全规则、沟通方式 |
| **用户** | USER.md | 用户画像、偏好、项目背景 |

## 🛠️ 技术架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Ollama    │     │   Qdrant    │     │ Memory Bank │
│  LLM + 嵌入  │◄───►│  向量数据库   │◄───►│  FastAPI    │
│  端口 11434  │     │  端口 6333   │     │  端口 8100   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 🚀 快速开始

```bash
# 1. 启动向量数据库
docker start qdrant

# 2. 启动 Memory Bank
cd AgentMemoryBank
python main.py

# 3. 启动 Ollama（本地模型）
ollama serve
```

## 📊 训练体系

- **AI-TRAINING-PLAN.md** — 完整训练计划
- **TOOL-COMBOS-TRAINING.md** — 工具组合训练
- **TRAINING-TASKS.md** — 训练任务清单
- **TRAINING-TRACKER.md** — 训练进度追踪

## 📄 License

MIT

---

<p align="center">
  Powered by <a href="https://github.com/openclaw/openclaw">OpenClaw</a> 🦞
</p>
