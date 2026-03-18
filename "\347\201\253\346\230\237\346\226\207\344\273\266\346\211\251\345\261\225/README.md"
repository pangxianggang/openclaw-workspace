# 火星文件管理浏览器扩展

让 CodeGPS Pro 网页访问本地火星文件管理系统，实现真正的代码编辑功能。

## 🚀 快速开始

### 方式一：HTTP 服务模式（推荐）

#### 1. 启动火星文件服务

双击运行：
```
启动火星文件服务.bat
```

或者命令行启动：
```bash
node fm-http-bridge.js
```

服务启动后会显示：
```
✅ 服务已启动：http://127.0.0.1:8765/rpc
```

#### 2. 加载浏览器扩展

1. 打开 Chrome/Edge 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `火星文件扩展` 文件夹

#### 3. 打开 CodeGPS Pro

在浏览器中打开：
```
C:\Users\Administrator\Desktop\CodeGPS-Pro.html
```

或访问集成页面：
```
C:\Users\Administrator\Desktop\火星文件扩展\CodeGPS-Mars.html
```

---

### 方式二：CLI 直接调用（开发模式）

火星文件管理支持直接命令行调用：

```bash
cd "C:\Users\Administrator\Desktop\火星文件"

# 查看目录树
node dist/cli/index.js tree . --depth 3

# 读取文件
node dist/cli/index.js read src/index.ts --start 0 --end 50

# 搜索
node dist/cli/index.js search "function" --regex

# 获取代码符号
node dist/cli/index.js symbols src/index.ts

# 应用编辑（先 dry-run）
node dist/cli/index.js apply src/index.ts \
  --ops "[{\"id\":\"op1\",\"type\":\"replace_range\",\"target\":{\"type\":\"range\",\"startLine\":10,\"endLine\":10},\"newText\":\"new code\"}]" \
  --base-version "sha256:abc123..." \
  --dry-run

# 提交
node dist/cli/index.js commit <transactionId>
```

---

## 📋 可用工具列表

### 查询类（只读）

| 工具 | 命令 | 说明 |
|------|------|------|
| fm_tree | `tree [path] [--depth N]` | 查看目录树 |
| fm_stat | `stat <path>` | 文件元数据 |
| fm_read_range | `read <path> [--start N] [--end N]` | 读取文件范围 |
| fm_search | `search <pattern> [--regex]` | 跨文件搜索 |
| fm_outline | `outline <path>` | Markdown 大纲 |
| fm_symbols | `symbols <path>` | 代码符号列表 |

### 修改类（事务式）

| 工具 | 命令 | 说明 |
|------|------|------|
| fm_apply_ops | `apply <path> --ops <json> --base-version <hash>` | 应用编辑 |
| fm_commit | `commit <transactionId>` | 提交事务 |
| fm_rollback | `rollback <transactionId>` | 回滚事务 |
| fm_create_file | `create <path> --content <text>` | 创建文件 |
| fm_delete_file | `delete <path> --confirm` | 删除文件 |
| fm_move_file | `move <source> <dest>` | 移动文件 |

---

## 🔧 开发说明

### 项目结构

```
火星文件扩展/
├── manifest.json           # 扩展配置
├── background.js           # 后台 HTTP 调用
├── content.js              # 内容脚本 + 注入
├── fm-integration.js       # AI 集成脚本
├── fm-http-bridge.js       # HTTP 桥接服务
├── fm-host.bat             # Native Host（备用）
├── fm-host-wrapper.js      # Native Host 包装器
├── 启动火星文件服务.bat     # 一键启动
├── CodeGPS-Mars.html       # 集成测试页面
└── README.md               # 本文档
```

### API 协议

HTTP 服务接收 JSON-RPC 风格的请求：

**请求格式：**
```json
POST http://127.0.0.1:8765/rpc
{
  "method": "tree",
  "params": {
    "path": ".",
    "depth": 3
  }
}
```

**响应格式：**
```json
{
  "success": true,
  "data": { ... }
}
```

### 浏览器扩展通信流程

```
网页 (fm-integration.js)
    ↓ postMessage
Content Script (content.js)
    ↓ chrome.runtime.sendMessage
Background Script (background.js)
    ↓ HTTP POST
HTTP 桥接 (fm-http-bridge.js)
    ↓ exec
火星文件 CLI (node dist/cli/index.js)
```

---

## ⚠️ 故障排除

### 服务无法启动

1. 检查 Node.js 是否安装：`node --version`
2. 检查火星文件是否构建：`ls dist/cli/index.js`
3. 检查端口是否被占用：`netstat -ano | findstr 8765`

### 扩展无法连接

1. 确认服务正在运行（查看控制台日志）
2. 检查防火墙是否阻止 8765 端口
3. 重启浏览器

### CLI 命令失败

1. 确保在火星文件目录下运行
2. 检查文件路径是否正确
3. 确保 baseVersion hash 正确

---

## 📄 License

MIT
