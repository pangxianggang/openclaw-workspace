# OpenClaw Workspace - 火星文件管理与智能编程平台

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-庞祥刚-green.svg)](https://github.com/pangxianggang)

> Chrome 扩展 (Manifest V3) + Node.js 命令行 AI 编程平台，集成多种 AI 模型与本地文件管理系统。

## 项目简介

本项目是一个面向开发者的本地化智能编程工具集，包含两个核心组件：

1. **火星文件管理 Bridge** - Chrome 扩展（Manifest V3），用于将 CodeGPS Pro 网页与本地火星文件管理 HTTP 服务连接
2. **火星编程平台** - Node.js 命令行 AI 编程平台，集成 DashScope、ZhipuAI、DeepSeek、Moonshot 等多种 AI 模型，提供智能代码分析、修复和文件管理功能

## 功能特性

### Chrome 扩展 (火星文件管理 Bridge)
- 通过 Content Script 注入 CodeGPS Pro 页面
- 与本地 HTTP Bridge 服务 (localhost:8765) 通信
- 支持 file://、localhost、127.0.0.1 等多种页面匹配
- Background Service Worker 后台运行

### 命令行编程平台 (mars-platform.js)
- 多 AI 模型支持：DashScope (通义千问)、ZhipuAI (智谱)、DeepSeek、Moonshot
- 交互式命令行编程体验
- 文件读写、目录浏览等本地文件管理操作
- 聊天历史记录与日志轮转
- MCP (Model Context Protocol) 服务器管理

### 智能代码修复 (code-fixer.js)
- AI 驱动的代码问题分析
- 自动生成精确修复方案
- 事务式修复应用，支持回滚

### MCP 管理器 (mcp-manager.js)
- 动态添加、删除、启用、禁用 MCP 服务器
- 服务器连接测试
- 配置文件持久化管理

## 项目结构

```
openclaw-workspace/
├── 火星文件扩展/
│   ├── manifest.json            # Chrome 扩展配置 (Manifest V3)
│   ├── background.js            # Service Worker 后台脚本
│   ├── content.js               # Content Script 注入脚本
│   ├── injected.js              # 页面注入脚本
│   ├── fm-integration.js        # 文件管理集成模块
│   ├── fm-http-bridge.js        # HTTP Bridge 服务
│   ├── fm-host-wrapper.js       # Native Messaging Host 包装器
│   ├── mars-platform.js         # 命令行 AI 编程平台 (主程序)
│   ├── code-fixer.js            # 智能代码修复模块
│   ├── mcp-manager.js           # MCP 服务器管理器
│   ├── system-prompt.js         # AI 系统提示词
│   ├── config.example.json      # 配置文件模板
│   ├── CodeGPS-Mars.html        # CodeGPS 集成页面
│   ├── *.bat                    # Windows 启动/安装脚本
│   └── *.md                     # 使用文档
├── .github/
│   ├── ISSUE_TEMPLATE/          # Issue 模板
│   └── pull_request_template.md # PR 模板
├── tests/                       # 单元测试
├── CONTRIBUTING.md              # 贡献指南
├── LICENSE                      # MIT 许可证
└── README.md                    # 本文件
```

## 快速开始

### 环境要求

- Node.js >= 18
- Chrome 浏览器（用于安装扩展）
- Windows 操作系统（部分 .bat 脚本仅支持 Windows）

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/pangxianggang/openclaw-workspace.git
cd openclaw-workspace
```

2. 配置 AI 服务

```bash
cd 火星文件扩展
cp config.example.json config.json
```

编辑 `config.json`，填入你的 API Key 和相关配置：

```json
{
  "apiKey": "your-api-key-here",
  "apiProvider": "dashscope",
  "apiModel": "qwen3.5-plus",
  "apiBaseUrl": "https://coding.dashscope.aliyuncs.com/v1",
  "workspace": "C:\\Users\\YourName\\Desktop",
  "fmCliPath": "C:\\Users\\YourName\\Desktop\\火星文件\\dist\\cli\\index.js"
}
```

3. 启动命令行编程平台

```bash
node mars-platform.js
```

4. 安装 Chrome 扩展

- 打开 Chrome，访问 `chrome://extensions/`
- 启用「开发者模式」
- 点击「加载已解压的扩展程序」，选择 `火星文件扩展/` 目录

### 使用 MCP 管理器

```bash
node mcp-manager.js list              # 列出所有 MCP 服务器
node mcp-manager.js add <名称> <命令>  # 添加服务器
node mcp-manager.js remove <名称>     # 删除服务器
node mcp-manager.js test <名称>       # 测试连接
```

## 支持的 AI 模型

| 提供商 | 模型示例 | 说明 |
|--------|---------|------|
| DashScope | qwen3.5-plus | 阿里云通义千问 |
| ZhipuAI | glm-4 | 智谱清言 |
| DeepSeek | deepseek-chat | DeepSeek |
| Moonshot | moonshot-v1 | Moonshot AI |

## 语言组成

- JavaScript: 60.3%
- HTML: 35.3%
- Batchfile: 3.8%

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 作者

庞祥刚 ([@pangxianggang](https://github.com/pangxianggang))

邮箱：pangxianggang@outlook.com
