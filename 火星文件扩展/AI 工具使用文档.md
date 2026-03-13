# CodeGPS Pro × 火星文件管理集成说明书

## 🎯 集成概述

本集成让 CodeGPS Pro 的 AI 助手能够直接使用火星文件管理工具，实现：
- 📖 读取本地文件（精确到行范围）
- ✏️ 精确编辑代码（外科手术式修改）
- 🔍 搜索跨文件内容
- 📊 查看目录结构和代码符号
- ↩️ 回滚修改（事务管理）

---

## 📚 AI 可用工具列表

### 查询类工具（只读）

#### 1. fm_tree - 查看目录树
```json
{
  "method": "fm_tree",
  "params": {
    "path": ".",
    "depth": 3
  }
}
```

#### 2. fm_stat - 获取文件信息
```json
{
  "method": "fm_stat",
  "params": {
    "path": "src/index.ts"
  }
}
```
返回：文件大小、SHA-256 hash、语言类型、总行数

#### 3. fm_read_range - 读取文件范围
```json
{
  "method": "fm_read_range",
  "params": {
    "path": "src/index.ts",
    "startLine": 0,
    "endLine": 50,
    "context": 3
  }
}
```

#### 4. fm_search - 跨文件搜索
```json
{
  "method": "fm_search",
  "params": {
    "pattern": "function getUser",
    "regex": true,
    "include": "**/*.ts"
  }
}
```

#### 5. fm_symbols - 获取代码符号
```json
{
  "method": "fm_symbols",
  "params": {
    "path": "src/index.ts"
  }
}
```
返回：函数、类、方法的名称和位置

#### 6. fm_outline - 获取 Markdown 大纲
```json
{
  "method": "fm_outline",
  "params": {
    "path": "README.md"
  }
}
```

---

### 修改类工具（事务式）

#### 7. fm_apply_ops - 应用编辑操作

**操作类型：**

| 操作 | 说明 |
|------|------|
| `replace_range` | 替换指定行范围 |
| `replace_anchor` | 基于锚点替换（前后标记之间） |
| `insert_before` | 在目标行之前插入 |
| `insert_after` | 在目标行之后插入 |
| `delete_range` | 删除指定区域 |
| `append_eof` | 文件末尾追加 |

**示例 - 替换代码：**
```json
{
  "method": "fm_apply_ops",
  "params": {
    "path": "src/index.ts",
    "baseVersion": "sha256:abc123...",
    "ops": [{
      "id": "op1",
      "type": "replace_range",
      "target": {
        "type": "range",
        "startLine": 10,
        "endLine": 15,
        "expectedOldText": "const x = 1;"
      },
      "newText": "const x = 2;\nconst y = 3;"
    }],
    "dryRun": true
  }
}
```

#### 8. fm_commit - 提交事务
```json
{
  "method": "fm_commit",
  "params": {
    "transactionId": "tx-abc123"
  }
}
```

#### 9. fm_rollback - 回滚事务
```json
{
  "method": "fm_rollback",
  "params": {
    "transactionId": "tx-abc123"
  }
}
```

---

## 🔄 标准编辑流程

### 步骤 1：读取和理解代码

AI 首先读取相关代码：

```
用户：帮我修复 src/utils.ts 中的 calculateTotal 函数

AI: 我先读取这个函数的代码...
[调用 fm_symbols 获取函数位置]
[调用 fm_read_range 读取函数内容]
```

### 步骤 2：规划修改

```
AI: 我发现了问题：
1. 第 25 行缺少 null 检查
2. 第 30 行类型转换错误

我建议进行以下修改...
```

### 步骤 3：Dry-run 预览

```
AI: [调用 fm_apply_ops with dryRun=true]

这是修改预览：
- const total = items.reduce(...)
+ const total = items?.reduce(...) || 0
```

### 步骤 4：等待用户确认

```
AI: 请确认是否进行这些修改？
[用户点击"确认"按钮]
```

### 步骤 5：提交修改

```
AI: [调用 fm_apply_ops with dryRun=false]
[调用 fm_commit]

✅ 修改已完成并提交
```

---

## 📝 完整示例对话

### 示例 1：修复代码 bug

```
用户：src/auth.ts 的验证逻辑有问题

AI: 让我先查看这个文件的结构。
[调用 fm_symbols path="src/auth.ts"]

找到 3 个函数：
- validateToken (行 15-45)
- refreshToken (行 50-80)
- logout (行 85-100)

请问是哪个函数的问题？

用户：validateToken

AI: [调用 fm_read_range path="src/auth.ts" startLine=15 endLine=45]

我发现了问题：第 28 行没有处理 token 过期的情况。

建议修改：
在第 28 行后添加过期检查：
+ if (token.exp < Date.now()) {
+   throw new Error('Token expired');
+ }

是否进行此修改？

用户：好的

AI: [调用 fm_apply_ops dryRun=true 生成预览]
[显示 diff]
[等待用户确认]
[调用 fm_commit]

✅ 修复完成
```

### 示例 2：添加新功能

```
用户：在 userController.ts 中添加 deleteUser 函数

AI: [调用 fm_symbols path="src/controllers/userController.ts"]

当前有这些函数：
- createUser (行 20-50)
- getUser (行 55-80)
- updateUser (行 85-120)

我将在 updateUser 函数后添加 deleteUser 函数。

[生成代码并调用 fm_apply_ops]

是否提交此修改？

用户：确认

AI: [调用 fm_commit]

✅ 新函数已添加
```

---

## ⚠️ 重要原则

### AI 必须遵守的规则

1. **先读取再修改** - 永远不要在不了解代码结构的情况下直接修改

2. **使用 dryRun 预览** - 提交前必须让用户看到修改内容

3. **等待用户确认** - 永远不要自作主张提交修改

4. **使用锚点定位** - 优先使用 `replace_anchor` 而非仅用行号（防止漂移）

5. **小步提交** - 大量修改时拆分为多个事务

6. **可回滚** - 每次修改都应该可以安全回滚

---

## 🔧 技术架构

```
┌─────────────────────────────────────┐
│ CodeGPS Pro (网页)                  │
│ - Monaco 编辑器                      │
│ - AI 对话框                          │
│ - fm-integration.js (注入)          │
└──────────────┬──────────────────────┘
               │ postMessage
┌──────────────▼──────────────────────┐
│ 浏览器扩展 (Content Script)          │
│ - content.js                        │
│ - 消息转发                          │
└──────────────┬──────────────────────┘
               │ chrome.runtime.sendMessage
┌──────────────▼──────────────────────┐
│ 扩展后台 (Background Script)         │
│ - background.js                     │
│ - 调用本地服务                      │
└──────────────┬──────────────────────┘
               │ HTTP / Native Messaging
┌──────────────▼──────────────────────┐
│ 火星文件管理 (fm serve / CLI)        │
│ - 文件读取/写入                     │
│ - 版本控制                          │
│ - 事务管理                          │
└─────────────────────────────────────┘
```

---

## 🚀 安装和配置

### 1. 安装浏览器扩展

1. 打开 Chrome/Edge 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `火星文件扩展` 文件夹

### 2. 启动火星文件管理服务（可选）

```bash
cd "C:\Users\Administrator\Desktop\火星文件"
npm start -- serve --port 8765
```

### 3. 打开 CodeGPS-Pro.html

在浏览器中打开：
```
C:\Users\Administrator\Desktop\CodeGPS-Pro.html
```

### 4. 验证集成

按 F12 打开控制台，应该看到：
```
[FM Integration] 火星文件管理集成已加载
[FM Bridge] 已注入火星文件管理集成脚本
```

---

## 📋 故障排除

| 问题 | 解决方法 |
|------|---------|
| 控制台没有 FM 日志 | 检查扩展是否已加载 |
| 工具调用失败 | 检查火星文件管理是否已构建 |
| 无法读取文件 | 检查工作区路径是否正确 |
| 保存失败 | 检查 baseVersion 是否正确 |

---

## 📄 License

MIT
