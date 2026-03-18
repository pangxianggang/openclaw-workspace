# 🔌 MCP 支持 - 使用指南

## 什么是 MCP

**MCP (Model Context Protocol)** 是一个开放协议，允许 AI 模型调用外部工具和服务。

火星编程平台支持 MCP，让你可以：
- ✅ 动态添加 MCP 服务器
- ✅ 动态删除 MCP 服务器
- ✅ 启用/禁用服务器
- ✅ AI 自动调用 MCP 工具

---

## 🚀 快速开始

### 1. 查看当前 MCP 配置

在平台中输入：
```
/mcp list
```

### 2. 添加 MCP 服务器

**示例 1：添加文件系统服务器**
```
/mcp add filesystem npx -y @modelcontextprotocol/server-filesystem /tmp
```

**示例 2：添加 GitHub 服务器**
```
/mcp add github npx -y @modelcontextprotocol/server-github
```

**示例 3：添加数据库服务器**
```
/mcp add sqlite npx -y @modelcontextprotocol/server-sqlite
```

### 3. 启用服务器
```
/mcp enable filesystem
```

### 4. 测试连接
```
/mcp test filesystem
```

### 5. 在对话中使用

```
❯ 读取 /tmp/test.txt 文件内容

🤖 思考中...
🔌 调用 MCP: filesystem.read_file({"path": "/tmp/test.txt"})

文件内容如下：
...
```

---

## 📋 MCP 命令列表

| 命令 | 说明 |
|------|------|
| `/mcp list` | 列出所有 MCP 服务器 |
| `/mcp add <名> <命令>` | 添加 MCP 服务器 |
| `/mcp remove <名>` | 删除 MCP 服务器 |
| `/mcp enable <名>` | 启用服务器 |
| `/mcp disable <名>` | 禁用服务器 |
| `/mcp test <名>` | 测试连接 |

---

## 🔧 常用的 MCP 服务器

### 文件系统
```bash
/mcp add filesystem npx -y @modelcontextprotocol/server-filesystem /path/to/dir
```

### GitHub
```bash
/mcp add github npx -y @modelcontextprotocol/server-github
```
需要设置环境变量：
```
GITHUB_TOKEN=your-token
```

### SQLite
```bash
/mcp add sqlite npx -y @modelcontextprotocol/server-sqlite
```

### Git
```bash
/mcp add git npx -y @modelcontextprotocol/server-git
```

### 浏览器
```bash
/mcp add browser npx -y @modelcontextprotocol/server-browser
```

---

## 📝 配置文件

MCP 配置保存在：
- **Windows**: `%APPDATA%\mars-platform\mcp-config.json`
- **Linux/Mac**: `~/.config/mars-platform/mcp-config.json`

配置格式：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
      "env": {},
      "description": "文件系统服务器",
      "disabled": false
    }
  }
}
```

---

## 🎯 AI 调用 MCP 示例

### 示例 1：读取文件

**用户**: 读取 /tmp/config.json 的内容

**AI 输出**:
```json
{"tool": "mcp", "server": "filesystem", "method": "read_file", "params": {"path": "/tmp/config.json"}}
```

### 示例 2：写入文件

**用户**: 在 /tmp/test.txt 中写入"Hello World"

**AI 输出**:
```json
{"tool": "mcp", "server": "filesystem", "method": "write_file", "params": {"path": "/tmp/test.txt", "content": "Hello World"}}
```

### 示例 3：GitHub 操作

**用户**: 查看我的 GitHub 仓库列表

**AI 输出**:
```json
{"tool": "mcp", "server": "github", "method": "list_repositories", "params": {}}
```

---

## ⚠️ 注意事项

1. **安全第一** - MCP 服务器可能有文件访问权限，只添加可信的服务器
2. **环境变量** - 某些服务器需要 API Token（如 GitHub）
3. **性能影响** - 每个 MCP 调用都会启动子进程
4. **超时设置** - 默认 30 秒超时

---

## 🐛 故障排除

### 问题 1：找不到 MCP 服务器
```
❌ MCP 服务器 "xxx" 不存在
```
**解决**: 使用 `/mcp list` 查看已配置的服务器

### 问题 2：服务器已禁用
```
❌ MCP 服务器 "xxx" 已禁用
```
**解决**: 使用 `/mcp enable xxx` 启用

### 问题 3：命令执行失败
```
❌ 执行错误：spawn npx ENOENT
```
**解决**: 确保 Node.js 和 npm 已安装

---

## 📚 更多资源

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [MCP 服务器列表](https://github.com/modelcontextprotocol/servers)
- [火星编程平台使用指南](./命令行编程平台 - 使用指南.md)

---

祝你使用愉快！🎉
