# OpenClaw Workspace

🦞 AI Agent Development Environment based on OpenClaw

## 🎯 Project Goal

Build a powerful AI agent development environment with:
- Multi-layer memory system (FastAPI + Qdrant + Ollama)
- Mars File Management System (Python API V2)
- AutoClaw integration (Zhipu AI)
- Rich skill ecosystem

## 📁 Project Structure

```
openclaw-workspace/
├── .openclaw/              # OpenClaw configuration
│   ├── openclaw.json       # Main configuration
│   └── workspace/          # Workspace files
├── skills/                 # Custom skills
│   ├── fm-engine/         # Mars File Management
│   └── ...
├── memory/                # Memory Bank daily logs
└── README.md
```

## 🚀 Features

### ✅ Completed
- [x] OpenClaw Gateway configuration (Port 18789)
- [x] Mars File Management Python API V2
  - Transaction support (version check/rollback)
  - Operation logging
  - Streaming processing
  - Batch operations (multi-threaded)
  - Async support
- [x] Memory Bank system (FastAPI + Qdrant + Ollama)
- [x] AutoClaw integration (Port 18790, independent session)
- [x] 15 AI models available (Qwen, GLM, Kimi, MiniMax, DeepSeek)

### 🔄 In Progress
- [ ] Skill development and optimization
- [ ] Multi-agent collaboration
- [ ] Advanced automation workflows

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Backend** | FastAPI, Python 3.14 |
| **Database** | PostgreSQL, Qdrant, SQLite |
| **AI/ML** | Ollama, LangChain, RAG |
| **Frontend** | React, Next.js, TypeScript |
| **DevOps** | Docker, Git, Linux, Nginx |
| **Platform** | OpenClaw, AutoClaw |

## 📊 System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   OpenClaw      │     │   AutoClaw      │     │  Memory Bank    │
│   Gateway:18789 │     │   Gateway:18790 │     │  Port: 8100     │
│   (Main)        │◄───►│   (Zhipu AI)    │     │  (Qdrant+Ollama)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Mars File Manager V2    │
                    │   - Transaction Support   │
                    │   - Operation Logging     │
                    │   - Streaming Processing  │
                    │   - Batch Operations      │
                    │   - Async Support         │
                    └───────────────────────────┘
```

## 🎯 Usage

### OpenClaw (Main Assistant)
```bash
# Gateway runs on port 18789
# Default model: bailian/qwen3.5-plus
```

### AutoClaw (Zhipu AI Client)
```bash
# Gateway runs on port 18790
# Default model: zai_pony-alpha-2
# Independent session configuration
```

### Mars File Management
```python
from fm_engine_v2 import FileEngineV2

engine = FileEngineV2(r"C:\Users\Administrator\Desktop")
engine.txn._check_all_files = True  # Enable version check

# Use transaction
with engine.txn.transaction():
    engine.edit("file.txt", line=1, content="new content\n")
```

## 📝 Development Notes

### Configuration Files
- `~/.openclaw/openclaw.json` - OpenClaw main config
- `~/.openclaw-autoclaw/openclaw.json` - AutoClaw config (independent session)
- `C:\Users\Administrator\AppData\Roaming\autoclaw\settings.json` - AutoClaw settings

### Important Ports
| Service | Port | Status |
|---------|------|--------|
| OpenClaw Gateway | 18789 | ✅ Running |
| AutoClaw Gateway | 18790 | ✅ Running |
| Memory Bank API | 8100 | ✅ Running |
| Qdrant DB | 6333 | ✅ Running |
| Ollama | 11434 | ✅ Running |

## 🏆 Achievements

- ✅ AutoClaw connection issue resolved (Gateway conflict fixed)
- ✅ Mars File Management V2 production ready
- ✅ Memory Bank system operational
- ✅ 15 AI models configured and available
- ✅ Session isolation between OpenClaw and AutoClaw

## 📅 Timeline

- **2026-03-11**: AutoClaw configuration completed, Gateway conflict resolved
- **2026-03-11**: Mars File Management V2 released
- **2026-03-11**: Memory Bank system integrated
- **2026-03-12**: OpenClaw Workspace repository created

## 👨‍💻 Author

**庞祥刚 (Pang Xianggang)**
- 📍 Location: Shenzhen, China
- 🌐 Role: Full-stack Developer & AI Enthusiast
- 🦞 Nickname: 阿里 (Ali) - AI Assistant
- 💼 Focus: Building AI Agent systems with OpenClaw

## 📄 License

MIT License - See LICENSE file for details

---

*Last updated: 2026-03-12*
*Powered by curiosity, driven by code* 🚀
