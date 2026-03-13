#!/usr/bin/env node

/**
 * 🔴 火星编程 CODE - 下一代智能编程平台
 *
 * 集成 AI 对话 + 火星文件管理 CLI + MCP 服务器
 * 国际化的命令行编程体验
 */

const readline = require('readline');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 导入 MCP 管理器
const mcpManager = require('./mcp-manager');

// 导入代码修复模块
const CodeFixer = require('./code-fixer');

// 加载配置文件
let userConfig = {};
const configPath = path.join(__dirname, 'config.json');
if (fs.existsSync(configPath)) {
  try {
    userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('✅ 配置文件已加载');
  } catch (e) {
    console.log('⚠️ 配置文件读取失败，使用默认配置');
  }
}

// 配置（优先级：环境变量 > 配置文件 > 默认值）
const CONFIG = {
  fmCliPath: process.env.FM_CLI_PATH || userConfig.fmCliPath || path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js'),
  workspace: process.env.FM_WORKSPACE || userConfig.workspace || 'C:\\Users\\Administrator\\Desktop',
  apiKey: process.env.AI_API_KEY || userConfig.apiKey || '',
  apiProvider: process.env.AI_PROVIDER || userConfig.apiProvider || 'dashscope',
  apiModel: process.env.AI_MODEL || userConfig.apiModel || 'qwen3.5-plus',
  apiBaseUrl: process.env.AI_BASE_URL || userConfig.apiBaseUrl || 'https://coding.dashscope.aliyuncs.com/v1',
};

// 日志配置
const LOG_CONFIG = {
  enabled: true,           // 是否启用日志
  maxFileSize: 1024 * 1024, // 最大日志文件大小 (1MB)
  backupCount: 5,          // 保留的日志文件数量
};

// 日志文件路径
const LOG_FILE = path.join(__dirname, 'chat-log.txt');

// 写入日志
function writeLog(text) {
  if (!LOG_CONFIG.enabled) return;

  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').substring(0, 19);
  const logEntry = `[${timestamp}] ${text}\n`;

  try {
    // 检查日志文件大小
    if (fs.existsSync(LOG_FILE)) {
      const stats = fs.statSync(LOG_FILE);
      if (stats.size > LOG_CONFIG.maxFileSize) {
        // 轮转日志文件
        rotateLogFiles();
      }
    }

    fs.appendFileSync(LOG_FILE, logEntry, 'utf-8');
  } catch (e) {
    // 忽略日志写入错误
  }
}

// 轮转日志文件
function rotateLogFiles() {
  try {
    // 删除最旧的日志
    const oldestLog = `${LOG_FILE}.${LOG_CONFIG.backupCount - 1}.txt`;
    if (fs.existsSync(oldestLog)) {
      fs.unlinkSync(oldestLog);
    }

    // 移动其他日志
    for (let i = LOG_CONFIG.backupCount - 2; i >= 0; i--) {
      const oldPath = i === 0 ? LOG_FILE : `${LOG_FILE}.${i}.txt`;
      const newPath = `${LOG_FILE}.${i + 1}.txt`;
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    }
  } catch (e) {
    // 忽略轮转错误
  }
}

// 支持的模型列表
const SUPPORTED_MODELS = [
  { id: 'qwen3.5-plus', name: 'Qwen 3.5 Plus', provider: '通义千问' },
  { id: 'qwen3-max-2026-01-23', name: 'Qwen 3 Max', provider: '通义千问' },
  { id: 'qwen3-coder-next', name: 'Qwen 3 Coder Next', provider: '通义千问' },
  { id: 'qwen3-coder-plus', name: 'Qwen 3 Coder Plus', provider: '通义千问' },
  { id: 'slm-5', name: 'SLM 5', provider: '通义千问' },
  { id: 'glm-4.7', name: 'GLM 4.7', provider: '智谱 AI' },
  { id: 'kimi-k2.5', name: 'Kimi K2.5', provider: '月之暗面' },
  { id: 'MiniMax-M2.5', name: 'MiniMax M2.5', provider: 'MiniMax' },
];

// 全局状态 - 连续执行控制
let continuousExecutionState = {
  isActive: false,        // 是否处于连续执行模式
  iterationsUsed: 0,      // 已用迭代次数
  maxIterations: 10,      // 最大迭代次数
  pendingTask: null,      // 挂起的任务描述
};

// 对话历史
const conversationHistory = [];
const HISTORY_FILE = path.join(__dirname, 'conversation-history.json');

// 上下文管理配置
const CONTEXT_CONFIG = {
  maxMessages: 50,        // 最大消息数量（不包括 system）
  compressThreshold: 30,  // 超过此数量开始压缩
  keepRecent: 10,         // 保留最近的消息不压缩
  maxIterations: 10,      // 连续执行最大迭代次数
};

// 压缩历史记录（将早期对话合并为摘要）
function compressHistory() {
  const messages = conversationHistory.filter(m => m.role !== 'system');

  if (messages.length <= CONTEXT_CONFIG.compressThreshold) {
    return; // 不需要压缩
  }

  // 保留最近的消息
  const recentMessages = messages.slice(-CONTEXT_CONFIG.keepRecent);
  const oldMessages = messages.slice(0, messages.length - CONTEXT_CONFIG.keepRecent);

  // 查找是否已有压缩摘要
  const existingSummaryIndex = conversationHistory.findIndex(
    m => m.role === 'system' && m.content.startsWith('[历史摘要]')
  );

  // 生成摘要提示
  const oldContent = oldMessages.map(m =>
    `[${m.role === 'user' ? '用户' : 'AI'}]: ${m.content.substring(0, 200)}`
  ).join('\n');

  const summaryPrompt = `[历史摘要] 以下是之前对话的摘要，请保留关键信息：
${oldContent.substring(0, 3000)}
（共 ${oldMessages.length} 条消息已压缩）`;

  if (existingSummaryIndex >= 0) {
    // 更新现有摘要
    conversationHistory[existingSummaryIndex].content = summaryPrompt;
  } else {
    // 添加新摘要
    conversationHistory.unshift({ role: 'system', content: summaryPrompt });
  }

  // 移除已压缩的旧消息（保留 system prompt 和最近消息）
  const systemPromptIndex = conversationHistory.findIndex(
    m => m.role === 'system' && m.content.includes('你是火星编程 CODE 平台的 AI 编程助手')
  );

  const messagesToRemove = conversationHistory.filter((m, i) => {
    if (m.role === 'system') return false;
    if (i <= systemPromptIndex) return false;
    const msgIndex = conversationHistory.slice(systemPromptIndex + 1).indexOf(m);
    return msgIndex < oldMessages.length;
  });

  messagesToRemove.forEach(m => {
    const index = conversationHistory.indexOf(m);
    if (index > systemPromptIndex) {
      conversationHistory.splice(index, 1);
    }
  });

  print(COLORS.gray, `  [已压缩 ${oldMessages.length} 条历史消息，保留最近 ${recentMessages.length} 条]\n`);
}

// 优化消息列表，准备发送给 AI
function prepareMessages() {
  // 首先检查是否需要压缩
  const messageCount = conversationHistory.filter(m => m.role !== 'system').length;
  if (messageCount > CONTEXT_CONFIG.compressThreshold) {
    compressHistory();
  }

  // 限制总消息数量
  const systemMessages = conversationHistory.filter(m => m.role === 'system');
  const userMessages = conversationHistory.filter(m => m.role !== 'system');

  if (userMessages.length > CONTEXT_CONFIG.maxMessages) {
    // 保留最早的 system 消息和最近的消息
    const recentMessages = userMessages.slice(-CONTEXT_CONFIG.maxMessages);
    return [...systemMessages, ...recentMessages];
  }

  return conversationHistory;
}

// 保存历史记录
function saveHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(conversationHistory, null, 2), 'utf-8');
  } catch (e) {
    // 忽略保存错误
  }
}

// 加载历史记录
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
      const history = JSON.parse(content);
      conversationHistory.push(...history);
      return true;
    }
  } catch (e) {
    // 忽略加载错误
  }
  return false;
}

// 颜色定义
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // 前景色
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // 背景色
  bgBlack: '\x1b[40m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
};

// ASCII Logo
const LOGO = `
██╗  ██╗██╗   ██╗███╗   ██╗████████╗██████╗  ██████╗ ██╗     ██╗   ██╗
╚██╗██╔╝██║   ██║████╗  ██║╚══██╔══╝██╔══██╗██╔═══██╗██║     ╚██╗ ██╔╝
 ╚███╔╝ ██║   ██║██╔██╗ ██║   ██║   ██████╔╝██║   ██║██║      ╚████╔╝
 ██╔██╗ ██║   ██║██║╚██╗██║   ██║   ██╔══██╗██║   ██║██║       ╚██╔╝
██╔╝ ██╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╔╝███████╗   ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝
`;

// 分隔线
const DIVIDER = '════════════════════════════════════════════════════════════';
const DIVIDER_THIN = '────────────────────────────────────────────────────────';

// 工具描述
const TOOLS_DESC = `
火星文件管理工具（重要 - 你可以连续调用这些工具完成复杂任务）：

核心命令：
- tree [path] [--depth N] - 查看目录树结构，例如：tree src --depth 2
- read <path> [--start N] [--end N] - 读取文件内容，例如：read file.txt --start 0 --end 100
- stat <path> - 获取文件信息（大小、创建时间等）
- search <pattern> [--include <glob>] - 搜索文件内容，例如：search "function" --include "**/*.ts"
- outline <path> - 获取 Markdown/代码文件大纲
- symbols <path> - 获取代码符号定义（函数、类等）
- create <path> --content <text> - 创建新文件
- delete <path> - 删除文件
- move <from> <to> - 移动/重命名文件
- diff <txId> - 查看事务的 diff 预览
- history - 查看最近的事务列表

调用格式（JSON）：
单个调用：{"tool": "fm", "command": "tree", "args": ["src", "--depth", "2"]}

连续调用（推荐用于复杂任务）：
[
  {"tool": "fm", "command": "tree", "args": ["彩虹文件"]},
  {"tool": "fm", "command": "read", "args": ["彩虹文件/文件 1.txt"]}
]

示例 - 查找并修复代码问题：
[
  {"tool": "fm", "command": "tree", "args": ["彩虹文件"]},
  {"tool": "fm", "command": "read", "args": ["彩虹文件/新建文本文档 1.txt"]}
]

MCP 工具：
配置 MCP 服务器后，可以调用外部服务。
格式：{"tool": "mcp", "server": "服务器名", "method": "方法", "params": {...}}
`;

// 系统提示词
const SYSTEM_PROMPT = `你是火星编程 CODE 平台的 AI 编程助手。

核心能力：
- 代码分析：读取和分析代码结构
- 代码修改：精确编辑文件
- 项目导航：查看目录、搜索代码
- MCP 工具：调用外部 MCP 服务
- 历史记录：可以查看和回忆之前的聊天内容
- 连续执行：连续调用工具完成复杂任务

工作流程：
1. 分析用户需求
2. 直接使用工具执行
3. 分析结果，继续下一步

重要提示：
- 快速执行：直接用 JSON 工具调用，不要解释
- 不要输出完整代码！只调用工具修复
- 使用 patch 命令直接修改文件内容
- 最多 10 次迭代，接近限制时尽快完成
- 任务完成后说"修复完成"

工具调用格式（只返回 JSON，不要其他内容）：
{"tool": "fm", "command": "patch", "args": ["文件路径", "原文本", "新文本"]}

回答规范：
- 工具调用：使用 JSON 代码块
- 不要解释过程，直接执行
- 禁止使用 markdown 标题（## **等）
- 简洁！简洁！再简洁！`;

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 输出函数（带日志）
function print(color, text) {
  // 去除 ANSI 颜色码后写入日志
  const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');
  writeLog(cleanText);
  console.log(`${color}${text}${COLORS.reset}`);
}

function printBold(color, text) {
  const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');
  writeLog(cleanText);
  console.log(`${color}${COLORS.bold}${text}${COLORS.reset}`);
}

function printCentered(color, text, width = 0) {
  const termWidth = width || process.stdout.columns || 80;
  const padding = Math.max(0, Math.floor((termWidth - text.length) / 2));
  const cleanText = `${' '.repeat(padding)}${text}`;
  writeLog(cleanText);
  console.log(`${color}${' '.repeat(padding)}${text}${COLORS.reset}`);
}

// 设置控制台缓冲区大小（Windows）
function setupConsoleBuffer() {
  try {
    // 使用 mode 命令设置控制台缓冲区大小
    // 增加缓冲区高度到 9999 行
    exec('mode con cols=120 lines=9999', (error) => {
      if (error) {
        // 如果 mode 命令失败，尝试使用 PowerShell
        exec('powershell -command "$Host.UI.RawUI.BufferSize = New-Object Management.Automation.Host.Size 120,9999"', () => {});
      }
    });
  } catch (e) {
    // 忽略设置错误
  }
}

// 执行火星文件 CLI
function executeFMCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const cmd = `node "${CONFIG.fmCliPath}" ${command} ${args.join(' ')}`;
    print(COLORS.gray, `  正在执行：fm ${command} ${args.join(' ')}`);

    exec(cmd, {
      cwd: CONFIG.workspace,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8',
      env: { ...process.env, FM_WORKSPACE: CONFIG.workspace },
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (e) {
        resolve({ raw: stdout });
      }
    });
  });
}

// 执行 patch 命令（自动获取版本并转换为 apply 命令）
async function executePatchCommand(filePath, originalText, newText) {
  try {
    // 第 1 步：获取文件版本
    const versionResult = await executeFMCommand('read', [filePath, '-s', '1', '-e', '1']);
    const version = versionResult.version;

    if (!version) {
      throw new Error('无法获取文件版本');
    }

    // 第 2 步：构建 apply 命令
    const ops = [{
      type: 'replace_range',
      target: originalText,
      replacement: newText
    }];

    const opsJson = JSON.stringify(ops);

    // 第 3 步：执行 apply 命令
    const result = await executeFMCommand('apply', [
      filePath,
      '--ops', opsJson,
      '--base-version', version,
      '--no-dry-run'
    ]);

    return result;
  } catch (error) {
    return { error: error.message };
  }
}

// 调用 MCP 服务器（带重试和超时）
async function callMcpServer(serverName, method, params, maxRetries = 2) {
  const serverConfig = mcpManager.getMcpServer(serverName);

  if (!serverConfig) {
    throw new Error(`MCP 服务器 "${serverName}" 不存在`);
  }

  if (serverConfig.disabled) {
    throw new Error(`MCP 服务器 "${serverName}" 已禁用`);
  }

  print(COLORS.gray, `  🔌 调用 MCP 服务：${serverName} - ${method}`);

  const callMCP = () => new Promise((resolve, reject) => {
    const child = spawn(serverConfig.command, [...serverConfig.args, method], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...serverConfig.env },
    });

    let stdout = '';
    let stderr = '';
    let hasResponse = false;

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: method,
      params: params || {},
    };

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();

    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });

    child.on('close', (code) => {
      hasResponse = true;
      if (code === 0 && stdout.trim()) {
        try {
          const result = JSON.parse(stdout.trim());
          resolve(result.result || result);
        } catch (e) {
          resolve({ raw: stdout });
        }
      } else {
        reject(new Error(stderr || `退出码 ${code}`));
      }
    });

    child.on('error', (err) => {
      if (!hasResponse) {
        reject(new Error(err.message));
      }
    });

    // 超时控制：60 秒
    setTimeout(() => {
      if (!hasResponse) {
        child.kill('SIGKILL');
        reject(new Error('MCP 调用超时 (60 秒)'));
      }
    }, 60000);
  });

  // 重试逻辑
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await callMCP();
      return result;
    } catch (error) {
      lastError = error;
      print(COLORS.gray, `  MCP 调用尝试 ${attempt + 1}/${maxRetries + 1} 失败：${error.message}`);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        print(COLORS.gray, `  等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`MCP 调用失败（已重试 ${maxRetries} 次）: ${lastError.message}`);
}

// 调用 AI API（带重试和超时）
async function callAI(messages, maxRetries = 3, timeout = 90000) {
  if (!CONFIG.apiKey) {
    throw new Error('未配置 AI API Key');
  }

  // 根据不同提供商选择 API 地址
  let url;
  if (CONFIG.apiProvider === 'dashscope') {
    url = `${CONFIG.apiBaseUrl}/chat/completions`;
  } else if (CONFIG.apiProvider === 'deepseek') {
    url = 'https://api.deepseek.com/chat/completions';
  } else {
    url = 'https://api.openrouter.ai/api/v1/chat/completions';
  }

  const body = {
    model: CONFIG.apiModel,
    messages: messages,
    temperature: 0.7,
    stream: false,
    max_tokens: 8192,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.apiKey}`,
  };

  if (CONFIG.apiProvider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://github.com/mars-fm';
    headers['X-Title'] = 'Mars Programming CODE';
  }

  // 重试逻辑
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 错误：${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]) {
        throw new Error('API 返回格式异常');
      }
      return data.choices[0].message.content;

    } catch (error) {
      lastError = error;
      print(COLORS.gray, `  API 调用尝试 ${attempt + 1}/${maxRetries + 1} 失败：${error.message}`);

      // 最后一次失败不再重试
      if (attempt < maxRetries) {
        // 指数退避：2 秒、4 秒、8 秒、16 秒
        const delay = Math.min(2000 * Math.pow(2, attempt), 10000);
        print(COLORS.gray, `  等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`API 调用失败（已重试 ${maxRetries} 次）: ${lastError.message}`);
}

// 解析工具调用（增强容错性）
function parseToolCall(content) {
  if (!content) return null;

  // 1. 尝试解析标准 JSON 代码块
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  // 2. 尝试解析无标记的 JSON 代码块
  const codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  // 3. 尝试解析内联的单个 JSON 对象（从 { 到最后一个 }）
  let braceCount = 0;
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      if (braceCount === 0) startIndex = i;
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0 && startIndex >= 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (startIndex >= 0 && endIndex >= 0) {
    try {
      const jsonStr = content.substring(startIndex, endIndex + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.tool) {
        return [parsed];
      }
    } catch (e) {}
  }

  // 4. 尝试解析 JSON 数组（从 [ 到最后一个 ]）
  let bracketCount = 0;
  startIndex = -1;
  endIndex = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '[') {
      if (bracketCount === 0) startIndex = i;
      bracketCount++;
    } else if (content[i] === ']') {
      bracketCount--;
      if (bracketCount === 0 && startIndex >= 0) {
        endIndex = i;
        break;
      }
    }
  }

  if (startIndex >= 0 && endIndex >= 0) {
    try {
      const jsonStr = content.substring(startIndex, endIndex + 1);
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {}
  }

  return null;
}

// 执行工具调用（支持连续执行）
async function executeToolCalls(toolCalls) {
  if (!toolCalls || !Array.isArray(toolCalls) || toolCalls.length === 0) return null;

  const results = [];
  for (const toolCall of toolCalls) {
    if (!toolCall || !toolCall.tool) {
      results.push({ error: '无效的工具调用' });
      continue;
    }

    try {
      let result;
      if (toolCall.tool === 'fm') {
        // 检查是否是 patch 命令
        if (toolCall.command === 'patch') {
          // patch 格式：["文件路径", "原文本", "新文本"]
          const [filePath, originalText, newText] = toolCall.args || [];
          result = await executePatchCommand(filePath, originalText, newText);
        } else {
          result = await executeFMCommand(toolCall.command, toolCall.args || []);
        }
      } else if (toolCall.tool === 'mcp') {
        result = await callMcpServer(toolCall.server, toolCall.method, toolCall.params);
      } else {
        result = { error: `未知的工具：${toolCall.tool}` };
      }
      results.push(result);
    } catch (error) {
      results.push({ error: error.message });
    }
  }

  return results.length === 1 ? results[0] : results;
}

// 显示欢迎界面
function showWelcome() {
  console.clear();

  // 显示 Logo
  print(COLORS.cyan, LOGO);
  printCentered(COLORS.bold + COLORS.brightCyan, '下一代智能编程平台', 80);
  print(COLORS.reset, '');
  print(COLORS.gray, DIVIDER);
  print(COLORS.reset, '');

  const mcpConfig = mcpManager.loadConfig();
  const mcpCount = Object.keys(mcpConfig.mcpServers || {}).length;

  const statusItems = [
    ['工作区', CONFIG.workspace],
    ['AI 引擎', CONFIG.apiKey ? `✅ 已配置 (${CONFIG.apiModel})` : '❌ 未配置'],
    ['MCP 服务', `${mcpCount} 个配置`],
    ['火星文件', '✅ 就绪'],
    ['代码修复', '✅ 已启用'],
  ];

  statusItems.forEach(([label, value]) => {
    print(COLORS.white, `  ${label}: ${COLORS.brightGreen}${value}${COLORS.reset}`);
  });

  print(COLORS.reset, '');
  print(COLORS.gray, DIVIDER);
  print(COLORS.reset, '');
  print(COLORS.dim, '  输入 /help 查看帮助  |  /fix 修复代码  |  /log 查看日志  |  /quit 退出');
  print(COLORS.reset, '');
  print(COLORS.dim, '  提示：聊天记录自动保存到 chat-log.txt，可以滑动窗口或使用 /log 查看');
  print(COLORS.reset, '');

  // 显示历史记录状态
  const messages = conversationHistory.filter(m => m.role !== 'system');
  if (messages.length > 0) {
    print(COLORS.gray, `  [已有 ${messages.length} 条历史对话，可以继续之前的话题]\n`);
  }

  // 显示日志文件状态
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    const sizeKB = Math.round(stats.size / 1024);
    print(COLORS.dim, `  [日志文件：${sizeKB}KB - 使用 /log 查看]\n`);
  }
}

// 显示继续/停止确认
function showContinuePrompt(taskDescription, iterationsUsed) {
  print(COLORS.reset, '');
  print(COLORS.yellow, '═══════════════════════════════════════════════════════════');
  print(COLORS.yellow, '  ⚠️  任务尚未完成，是否继续执行？');
  print(COLORS.yellow, '═══════════════════════════════════════════════════════════');
  print(COLORS.reset, '');
  print(COLORS.white, `  已执行迭代：${iterationsUsed} 次`);
  print(COLORS.white, `  当前任务：${taskDescription}\n`);
  print(COLORS.cyan, '  选择：\n');
  print(COLORS.white, '    [1] 继续执行（让 AI 继续完成任务）');
  print(COLORS.white, '    [2] 停止执行（查看当前结果）');
  print(COLORS.white, '    [3] 增加迭代次数（设置新的最大值）');
  print(COLORS.white, '    [4] 查看详细历史');
  print(COLORS.reset, '');
}

// 等待用户选择（继续/停止）
async function waitForContinueStop() {
  return new Promise((resolve) => {
    const promptText = COLORS.brightYellow + '\n  请选择 [1-4]: ' + COLORS.reset;
    rl.question(promptText, (answer) => {
      const choice = answer.trim().toLowerCase();

      if (choice === '1' || choice === '继续' || choice === 'y') {
        resolve('continue');
      } else if (choice === '2' || choice === '停止' || choice === 'n') {
        resolve('stop');
      } else if (choice === '3' || choice === '增加') {
        rl.question(COLORS.cyan + '  请输入新的最大迭代次数 (当前 10): ' + COLORS.reset, (newMax) => {
          const num = parseInt(newMax);
          if (num > 0 && num <= 50) {
            CONTEXT_CONFIG.maxIterations = num;
            print(COLORS.green, `  最大迭代次数已设置为：${num}\n`);
            resolve('continue');
          } else {
            print(COLORS.yellow, '  无效的输入，使用默认值 10\n');
            CONTEXT_CONFIG.maxIterations = 10;
            resolve('continue');
          }
        });
      } else if (choice === '4' || choice === '详情') {
        showHistory();
        resolve('continue');
      } else {
        print(COLORS.yellow, '  默认继续执行\n');
        resolve('continue');
      }
    });
  });
}

// 主对话循环
async function chatLoop() {
  showWelcome();

  // 加载历史记录
  loadHistory();

  conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });

  while (true) {
    try {
      const userInput = await new Promise((resolve) => {
        rl.question(COLORS.brightGreen + '\n🚀 火星编程 CODE ❯ ' + COLORS.reset, resolve);
      });

      const trimmedInput = userInput.trim();

      // 处理特殊命令
      if (trimmedInput.startsWith('/')) {
        const parts = trimmedInput.slice(1).split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (cmd === 'quit' || cmd === 'exit') {
          print(COLORS.yellow, '\n  感谢使用火星编程 CODE，再见！\n');
          rl.close();
          process.exit(0);
        } else if (cmd === 'help') {
          showHelp();
          continue;
        } else if (cmd === 'clear') {
          const deleteAll = args[0] === 'all' || args.join(' ').includes('所有');
          if (deleteAll) {
            conversationHistory.length = 0;
            fs.unlinkSync(HISTORY_FILE);
            print(COLORS.yellow, '  所有历史记录已删除\n');
          } else {
            // 只清空当前会话，保留文件
            conversationHistory.length = 0;
            conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });
            print(COLORS.yellow, '  当前对话已清空（历史记录仍可用 /history 查看）\n');
          }
          continue;
        } else if (cmd === 'history' || cmd === 'hist') {
          showHistory();
          continue;
        } else if (cmd === 'log' || cmd === 'logs') {
          // 查看聊天日志文件
          const lines = args[0] ? parseInt(args[0]) : 50;
          showLog(lines);
          continue;
        } else if (cmd === 'clearlog') {
          // 清空日志文件
          if (fs.existsSync(LOG_FILE)) {
            fs.unlinkSync(LOG_FILE);
            print(COLORS.yellow, '  聊天日志已清空\n');
          } else {
            print(COLORS.yellow, '  暂无聊天日志\n');
          }
          continue;
        } else if (cmd === 'delete') {
          // 删除指定记录或最后一条
          const num = parseInt(args[0]);
          if (args[0] === 'last' || !args[0]) {
            const lastUserIndex = conversationHistory.findLastIndex(m => m.role === 'user');
            if (lastUserIndex >= 0) {
              conversationHistory.splice(lastUserIndex, 1);
              saveHistory();
              print(COLORS.yellow, '  已删除最后一条用户消息\n');
            } else {
              print(COLORS.yellow, '  没有可删除的消息\n');
            }
          } else if (num > 0) {
            const messages = conversationHistory.filter(m => m.role !== 'system');
            if (num <= messages.length) {
              const target = messages[num - 1];
              const index = conversationHistory.indexOf(target);
              if (index >= 0) {
                conversationHistory.splice(index, 1);
                saveHistory();
                print(COLORS.yellow, `  已删除第 ${num} 条消息\n`);
              }
            } else {
              print(COLORS.yellow, `  没有第 ${num} 条消息\n`);
            }
          } else {
            print(COLORS.yellow, '  用法：/delete [序号] 或 /delete last\n');
          }
          continue;
        } else if (cmd === 'summarize' || cmd === 'summary') {
          await summarizeHistory();
          continue;
        } else if (cmd === 'config') {
          showConfig();
          continue;
        } else if (cmd === 'mcp') {
          await handleMcpCommand(args.join(' '));
          continue;
        } else if (cmd === 'setconmode') {
          // 手动设置控制台缓冲区
          print(COLORS.cyan, '  正在设置控制台缓冲区...\n');
          setupConsoleBuffer();
          print(COLORS.green, '  控制台缓冲区已设置：120 列 x 9999 行\n');
          print(COLORS.gray, '  提示：现在应该可以滑动窗口查看历史内容了\n');
          continue;
        } else if (cmd === 'api') {
          const key = args.join(' ');
          if (key) {
            CONFIG.apiKey = key;
            print(COLORS.brightGreen, '  API Key 已设置\n');
          } else {
            print(COLORS.brightYellow, '  用法：/api <your-api-key>\n');
          }
          continue;
        } else if (cmd === 'model') {
          const modelId = args.join(' ');
          if (!modelId) {
            print(COLORS.brightYellow, '  用法：/model <模型 ID>');
            print(COLORS.gray, '  可用模型：qwen3.5-plus, qwen3-max-2026-01-23, qwen3-coder-next, qwen3-coder-plus, slm-5, glm-4.7, kimi-k2.5, MiniMax-M2.5\n');
          } else {
            const model = SUPPORTED_MODELS.find(m => m.id === modelId);
            if (model) {
              CONFIG.apiModel = modelId;
              print(COLORS.brightGreen, `  模型已切换：${modelId} (${model.name})\n`);
            } else {
              print(COLORS.brightYellow, `  未知的模型 ID: ${modelId}\n`);
            }
          }
          continue;
        } else if (cmd === 'status') {
          showStatus();
          continue;
        } else if (cmd === 'fix') {
          // 代码修复命令：/fix <文件路径> <问题描述>
          const fixArgs = args.join(' ').trim();
          if (!fixArgs) {
            print(COLORS.brightYellow, '  用法：/fix <文件路径> <问题描述>');
            print(COLORS.gray, '  示例：/fix src/index.js 修复内存泄漏问题\n');
            continue;
          }
          
          const spaceIndex = fixArgs.indexOf(' ');
          if (spaceIndex === -1) {
            print(COLORS.brightYellow, '  用法：/fix <文件路径> <问题描述>\n');
            continue;
          }
          
          const filePath = fixArgs.substring(0, spaceIndex).trim();
          const problem = fixArgs.substring(spaceIndex + 1).trim();
          
          if (!fs.existsSync(filePath)) {
            print(COLORS.brightRed, `  文件不存在：${filePath}\n`);
            continue;
          }
          
          if (!CONFIG.apiKey) {
            print(COLORS.brightYellow, '  请先配置 API Key: /api your-api-key\n');
            continue;
          }
          
          try {
            const codeFixer = new CodeFixer(CONFIG);
            const aiClient = {
              chat: async (prompt) => {
                const messages = [
                  { role: 'system', content: '你是一个专业的代码修复专家。' },
                  { role: 'user', content: prompt }
                ];
                return await callAI(messages);
              }
            };
            
            print(COLORS.cyan, '\n  🔍 开始分析代码问题...\n');
            const result = await codeFixer.fixCode(filePath, problem, aiClient, false);
            
            if (result.success) {
              print(COLORS.brightGreen, `  ✅ ${result.message}\n`);
              print(COLORS.gray, '  提示：预览无误后，使用 /commit <transactionId> 提交修复\n');
            } else {
              print(COLORS.brightYellow, `  ⚠️ ${result.message}\n`);
            }
          } catch (error) {
            print(COLORS.brightRed, `  ❌ 修复失败：${error.message}\n`);
          }
          continue;
        } else if (cmd === 'commit') {
          const transactionId = args.join(' ').trim();
          if (!transactionId) {
            print(COLORS.brightYellow, '  用法：/commit <transactionId>\n');
            continue;
          }
          
          try {
            const codeFixer = new CodeFixer(CONFIG);
            const result = await codeFixer.commitFix(transactionId);
            print(COLORS.brightGreen, `  ✅ ${result.message}\n`);
          } catch (error) {
            print(COLORS.brightRed, `  ❌ 提交失败：${error.message}\n`);
          }
          continue;
        }
      }

      if (!trimmedInput) continue;

      // 检查 API
      if (!CONFIG.apiKey) {
        print(COLORS.brightYellow, '\n  未配置 AI API Key');
        print(COLORS.gray, '  请输入：/api your-api-key\n');
        continue;
      }

      // 添加用户消息
      conversationHistory.push({ role: 'user', content: trimmedInput });

      // 调用 AI（使用优化后的消息列表）
      print(COLORS.dim, '\n  AI 正在思考...\n');

      const messagesToSend = prepareMessages();
      const aiResponse = await callAI(messagesToSend);

      // 检查工具调用
      const toolCalls = parseToolCall(aiResponse);

      if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
        // 检查是否有有效的工具调用
        const hasValidTool = toolCalls.some(tc => tc && (tc.tool === 'fm' || tc.tool === 'mcp'));

        if (hasValidTool) {
          // 显示要执行的工具
          toolCalls.forEach((tc, i) => {
            if (tc && tc.tool) {
              const toolName = tc.tool === 'fm'
                ? `${tc.command}`
                : `${tc.server}`;
              const args = tc.args ? tc.args.join(' ') : '';
              print(COLORS.dim, `  → ${toolName} ${args}`);
            }
          });
          print(COLORS.reset, '');

          try {
            // 执行所有工具调用
            const results = await executeToolCalls(toolCalls);

            conversationHistory.push({ role: 'assistant', content: aiResponse });
            conversationHistory.push({
              role: 'user',
              content: `工具执行结果：${JSON.stringify(results, null, 2)}`,
            });

            print(COLORS.dim, '  AI 正在分析结果...\n');

            // 连续执行循环 - 让 AI 可以连续调用工具直到完成任务
            let continueExecution = true;
            let iterationsUsed = 0;
            const taskDescription = trimmedInput.substring(0, 50) + '...';

            // 显示处理状态
            print(COLORS.dim, '\n  💭 AI 正在思考处理中...（最多 10 次迭代）\n');

            while (continueExecution && iterationsUsed < CONTEXT_CONFIG.maxIterations) {
              iterationsUsed++;

              // 第 9 次迭代时弹出确认菜单
              if (iterationsUsed === 9) {
                print(COLORS.reset, '');
                print(COLORS.yellow, '═══════════════════════════════════════════════════════════');
                print(COLORS.yellow, '  ⚠️  已执行 9 次迭代，任务尚未完成');
                print(COLORS.yellow, '═══════════════════════════════════════════════════════════');
                print(COLORS.reset, '');
                print(COLORS.cyan, '  请选择：[B] 继续执行  [N] 停止\n');

                const choice = await new Promise((resolve) => {
                  rl.question(COLORS.brightYellow + '  > ' + COLORS.reset, (ans) => {
                    resolve(ans.trim().toLowerCase());
                  });
                });

                if (choice === 'n' || choice === 'stop' || choice === '停止') {
                  print(COLORS.yellow, '\n  已停止执行\n');
                  break;
                }
                print(COLORS.green, '\n  继续执行...\n');
              }

              // 只显示简单状态，不显示迭代细节
              if (iterationsUsed > 1) {
                print(COLORS.dim, `  [迭代 ${iterationsUsed}] 处理中...\n`);
              }

              let finalResponse;
              try {
                const messagesToSend = prepareMessages();
                finalResponse = await callAI(messagesToSend);
              } catch (apiError) {
                print(COLORS.brightRed, `  API 调用失败：${apiError.message}`);
                conversationHistory.push({
                  role: 'user',
                  content: `API 调用失败：${apiError.message}`,
                });
                break;
              }

              // 检查是否还有工具调用
              const nextToolCalls = parseToolCall(finalResponse);

              if (nextToolCalls && nextToolCalls.length > 0) {
                const hasValidNextTool = nextToolCalls.some(tc => tc && (tc.tool === 'fm' || tc.tool === 'mcp'));

                if (hasValidNextTool) {
                  // 简单显示正在执行的工具
                  if (iterationsUsed === 1) {
                    nextToolCalls.forEach((tc) => {
                      if (tc && tc.tool === 'fm') {
                        const toolName = tc.tool === 'fm'
                          ? `火星文件：${tc.command}`
                          : `MCP 服务：${tc.server}`;
                        const args = tc.args ? tc.args.join(' ') : '';
                        print(COLORS.dim, `  → ${toolName} ${args}`);
                      }
                    });
                    print(COLORS.reset, '');
                  }

                  try {
                    const nextResults = await executeToolCalls(nextToolCalls);
                    conversationHistory.push({ role: 'assistant', content: finalResponse });
                    conversationHistory.push({
                      role: 'user',
                      content: `工具执行结果：${JSON.stringify(nextResults, null, 2)}`,
                    });
                    print(COLORS.dim, '  AI 正在分析结果...\n');
                    // 继续循环，让 AI 继续调用工具
                    continue;
                  } catch (execError) {
                    print(COLORS.brightRed, `  工具执行失败：${execError.message}`);
                    conversationHistory.push({
                      role: 'user',
                      content: `工具执行失败：${execError.message}`,
                    });
                    // 工具执行失败，继续让 AI 处理错误
                    continue;
                  }
                }
              }

              // 没有更多工具调用，显示最终回复
              print(COLORS.brightWhite, '\n' + finalResponse + '\n');
              conversationHistory.push({ role: 'assistant', content: finalResponse });
              continueExecution = false;
            }

            // 检查是否达到最大迭代次数且任务可能未完成
            if (iterationsUsed >= CONTEXT_CONFIG.maxIterations) {
              // 检查 AI 最后回复是否包含完成标志
              const lastMessage = conversationHistory[conversationHistory.length - 1];
              const isComplete = lastMessage && (
                lastMessage.content.includes('完成') ||
                lastMessage.content.includes('总结') ||
                lastMessage.content.includes('分析完毕') ||
                lastMessage.content.includes('已完成')
              );

              if (!isComplete) {
                // 显示确认提示
                showContinuePrompt(taskDescription, iterationsUsed);
                const choice = await waitForContinueStop();

                if (choice === 'continue') {
                  print(COLORS.green, '\n  继续执行任务...\n');
                  // 重置迭代计数器，允许继续执行
                  continueExecution = true;
                } else {
                  print(COLORS.yellow, '\n  已停止执行，用户可以查看当前结果\n');
                }
              }
            }

          } catch (error) {
            print(COLORS.brightRed, `  执行失败：${error.message}\n`);
            conversationHistory.push({
              role: 'user',
              content: `工具执行失败：${error.message}`,
            });
          }
        } else {
          // 没有有效工具调用，直接显示回复
          print(COLORS.brightWhite, '\n' + aiResponse + '\n');
          conversationHistory.push({ role: 'assistant', content: aiResponse });
        }
      } else {
        print(COLORS.brightWhite, '\n' + aiResponse + '\n');
        conversationHistory.push({ role: 'assistant', content: aiResponse });
      }

      // 保存历史记录
      saveHistory();

    } catch (error) {
      print(COLORS.brightRed, `  系统错误：${error.message}\n`);
    }
  }
}

// 处理 MCP 命令
async function handleMcpCommand(input) {
  const parts = input.split(/\s+/);
  const subCmd = parts[0]?.toLowerCase();
  const name = parts[1];
  const rest = parts.slice(2).join(' ');

  print(COLORS.reset, '');

  switch (subCmd) {
    case 'list':
    case 'ls':
      mcpManager.listMcpServers();
      break;

    case 'add':
      if (!name) {
        print(COLORS.brightYellow, '  用法：/mcp add <名称> <命令>');
        return;
      }
      const cmdParts = rest.split(' ');
      const command = cmdParts[0];
      const args = cmdParts.slice(1);
      await mcpManager.addMcpServer(name, { command, args });
      print(COLORS.gray, '  💡 提示：使用 /mcp enable <名称> 启用服务\n');
      break;

    case 'remove':
    case 'rm':
      if (!name) {
        print(COLORS.brightYellow, '  用法：/mcp remove <名称>');
        return;
      }
      mcpManager.removeMcpServer(name);
      break;

    case 'enable':
      if (!name) {
        print(COLORS.brightYellow, '  用法：/mcp enable <名称>');
        return;
      }
      mcpManager.toggleMcpServer(name, true);
      break;

    case 'disable':
      if (!name) {
        print(COLORS.brightYellow, '  用法：/mcp disable <名称>');
        return;
      }
      mcpManager.toggleMcpServer(name, false);
      break;

    case 'test':
      if (!name) {
        print(COLORS.brightYellow, '  用法：/mcp test <名称>');
        return;
      }
      await mcpManager.testMcpServer(name);
      break;

    default:
      print(COLORS.cyan, '  MCP 管理命令:');
      print(COLORS.gray, '    /mcp list              - 列出 MCP 服务器');
      print(COLORS.gray, '    /mcp add <名> <命令>   - 添加 MCP 服务器');
      print(COLORS.gray, '    /mcp remove <名>       - 删除 MCP 服务器');
      print(COLORS.gray, '    /mcp enable <名>       - 启用服务器');
      print(COLORS.gray, '    /mcp disable <名>      - 禁用服务器');
      print(COLORS.gray, '    /mcp test <名>         - 测试连接\n');
  }
}

// 显示帮助
function showHelp() {
  print(COLORS.reset, '');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 CODE - 帮助文档');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.reset, '');

  print(COLORS.brightYellow, '  对话命令:');
  print(COLORS.white, '    /help              显示此帮助信息');
  print(COLORS.white, '    /quit              退出程序');
  print(COLORS.white, '    /clear [all]       清空对话 (all 删除所有历史)');
  print(COLORS.white, '    /history           查看历史记录');
  print(COLORS.white, '    /delete [序号]     删除指定消息');
  print(COLORS.white, '    /summarize         总结历史对话');
  print(COLORS.white, '    /config            显示当前配置');
  print(COLORS.white, '    /api <key>         设置 AI API Key');
  print(COLORS.white, '    /model <模型>      切换 AI 模型');
  print(COLORS.white, '    /fix <文件> <问题>  智能修复代码问题');
  print(COLORS.white, '    /commit <ID>       提交修复事务');
  print(COLORS.white, '    /mcp ...           MCP 管理命令');
  print(COLORS.white, '    /status            显示系统状态');
  print(COLORS.white, '    /log [行数]        查看聊天日志 (默认 50 行)');
  print(COLORS.white, '    /clearlog          清空聊天日志');
  print(COLORS.white, '    /setconmode        设置控制台缓冲区');
  print(COLORS.reset, '');

  print(COLORS.brightYellow, '  MCP 命令:');
  print(COLORS.white, '    /mcp list          列出 MCP 服务器');
  print(COLORS.white, '    /mcp add <名> <命令>  添加服务器');
  print(COLORS.white, '    /mcp remove <名>   删除服务器');
  print(COLORS.white, '    /mcp enable        启用服务器');
  print(COLORS.white, '    /mcp disable       禁用服务器');
  print(COLORS.white, '    /mcp test <名>     测试连接');
  print(COLORS.reset, '');

  print(COLORS.brightYellow, '  使用示例:');
  print(COLORS.white, '    帮我查看 src 目录结构');
  print(COLORS.white, '    读取 src/index.ts 的前 50 行');
  print(COLORS.white, '    搜索所有 TypeScript 文件中的 getUser 函数');
  print(COLORS.white, '    分析这个文件的代码结构');
  print(COLORS.reset, '');

  print(COLORS.gray, DIVIDER_THIN);
  print(COLORS.reset, '');
}

// 显示聊天日志
function showLog(lines = 50) {
  print(COLORS.reset, '');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.cyan, '  聊天日志');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.reset, '');

  if (!fs.existsSync(LOG_FILE)) {
    print(COLORS.gray, '  暂无聊天日志\n');
    return;
  }

  try {
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const allLines = content.split('\n').filter(line => line.trim());
    const recentLines = allLines.slice(-lines);

    if (recentLines.length === 0) {
      print(COLORS.gray, '  暂无日志内容\n');
      return;
    }

    print(COLORS.white, `  显示最近 ${recentLines.length} 行日志：\n`);
    print(COLORS.gray, '─'.repeat(60));

    recentLines.forEach(line => {
      print(COLORS.white, `  ${line}`);
    });

    print(COLORS.gray, '─'.repeat(60));
    print(COLORS.reset, '');
    print(COLORS.dim, `  提示：使用 /log <行数> 查看更多日志，例如 /log 100\n`);
    print(COLORS.dim, `  日志文件位置：${LOG_FILE}\n`);
    print(COLORS.reset, '');
  } catch (error) {
    print(COLORS.brightRed, `  读取日志失败：${error.message}\n`);
  }
}

// 显示配置
function showConfig() {
  print(COLORS.reset, '');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.cyan, '  当前配置');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.reset, '');

  print(COLORS.white, `  工作区：    ${COLORS.brightGreen}${CONFIG.workspace}${COLORS.reset}`);
  print(COLORS.white, `  API 提供商： ${COLORS.brightGreen}${CONFIG.apiProvider}${COLORS.reset}`);
  print(COLORS.white, `  API 模型：   ${COLORS.brightGreen}${CONFIG.apiModel}${COLORS.reset}`);
  print(COLORS.white, `  API 地址：   ${COLORS.gray}${CONFIG.apiBaseUrl}${COLORS.reset}`);
  print(COLORS.white, `  API Key:    ${COLORS.brightGreen}${CONFIG.apiKey ? CONFIG.apiKey.substring(0, 8) + '...' : '(未设置)'}${COLORS.reset}`);
  print(COLORS.reset, '');

  // 显示支持的模型列表
  print(COLORS.brightYellow, '  支持的模型:');
  SUPPORTED_MODELS.forEach((m, i) => {
    const current = m.id === CONFIG.apiModel ? '[当前]' : '      ';
    print(COLORS.white, `    ${current} ${m.id} ${COLORS.gray}(${m.provider})${COLORS.reset}`);
  });
  print(COLORS.reset, '');
  print(COLORS.gray, '  切换模型：/model <模型 ID>');
  print(COLORS.reset, '');

  const mcpConfig = mcpManager.loadConfig();
  const mcpCount = Object.keys(mcpConfig.mcpServers || {}).length;
  print(COLORS.white, `  MCP 服务器：${COLORS.brightCyan}${mcpCount} 个${COLORS.reset}`);
  print(COLORS.reset, '');
}

// 显示历史记录
function showHistory() {
  print(COLORS.reset, '');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.cyan, '  历史记录');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.reset, '');

  // 过滤掉 system prompt
  const messages = conversationHistory.filter(m => m.role !== 'system');

  if (messages.length === 0) {
    print(COLORS.gray, '  暂无历史记录\n');
    return;
  }

  print(COLORS.white, `  共 ${messages.length} 条对话，AI 可以查看和分析这些记录\n`);
  print(COLORS.gray, '  示例命令:\n');
  print(COLORS.white, '    查看之前的聊天内容\n');
  print(COLORS.white, '    继续我们刚才讨论的话题\n');
  print(COLORS.white, '    总结一下我们都聊了什么\n');
  print(COLORS.white, '    删除最后一条消息：/delete last\n');
  print(COLORS.white, '    删除第 1 条消息：/delete 1\n');
  print(COLORS.white, '    清空所有历史：/clear all\n');
  print(COLORS.reset, '');

  messages.forEach((msg, i) => {
    const role = msg.role === 'user' ? '你' : 'AI';
    const color = msg.role === 'user' ? COLORS.brightCyan : COLORS.brightWhite;
    const preview = msg.content.substring(0, 80).replace(/\n/g, ' ');
    print(COLORS.white, `  ${i + 1}. ${color}[${role}]${COLORS.reset} ${preview}...`);
  });

  print(COLORS.reset, '');
}

// 总结历史记录
async function summarizeHistory() {
  if (!CONFIG.apiKey) {
    print(COLORS.yellow, '  未配置 AI API Key\n');
    return;
  }

  const messages = conversationHistory.filter(m => m.role !== 'system');

  if (messages.length === 0) {
    print(COLORS.gray, '  暂无历史记录可总结\n');
    return;
  }

  print(COLORS.dim, '  AI 正在总结历史记录...\n');

  try {
    const summaryMessages = [
      { role: 'system', content: '请总结这段对话历史，列出主要讨论的话题和结论。使用简洁的中文。' },
      ...messages,
    ];

    const summary = await callAI(summaryMessages);
    print(COLORS.brightWhite, '\n' + summary + '\n');
  } catch (error) {
    print(COLORS.brightRed, `  总结失败：${error.message}\n`);
  }
}

// 显示状态
function showStatus() {
  print(COLORS.reset, '');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.cyan, '  系统状态                                                      ');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════════');
  print(COLORS.reset, '');

  const checks = [
    ['火星文件 CLI', fs.existsSync(CONFIG.fmCliPath)],
    ['AI API Key', !!CONFIG.apiKey],
    ['MCP 配置', true],
  ];

  checks.forEach(([name, ok]) => {
    const status = ok ? '[OK]' : '[FAIL]';
    const color = ok ? COLORS.brightGreen : COLORS.brightRed;
    print(COLORS.white, `  ${status} ${name}: ${color}${ok ? '正常' : '异常'}${COLORS.reset}`);
  });

  print(COLORS.reset, '');
}

// 启动检查
console.log('');
if (!fs.existsSync(CONFIG.fmCliPath)) {
  print(COLORS.brightRed, `  [FAIL] 火星文件 CLI 不存在：${CONFIG.fmCliPath}`);
  print(COLORS.gray, '  请运行：cd 火星文件 && npm run build\n');
  process.exit(1);
}

// 设置控制台缓冲区
setupConsoleBuffer();

// 启动
chatLoop().catch(console.error);
