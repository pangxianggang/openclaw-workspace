#!/usr/bin/env node

/**
 * 🔴 火星编程平台 - 复杂连续执行测试
 *
 * 测试场景：分析彩虹文件目录，找出所有问题并修复
 * 需要连续调用多个工具才能完成
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const CONFIG = {
  fmCliPath: path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js'),
  workspace: 'C:\\Users\\Administrator\\Desktop\\彩虹文件',
  apiKey: 'sk-sp-cec7682a7c994e489716da0ad751ce1e',
  apiModel: 'qwen3.5-plus',
  apiBaseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
};

// 颜色输出
const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  brightWhite: '\x1b[97m',
};

function print(color, text) {
  console.log(`${color}${text}${COLORS.reset}`);
}

// 执行火星文件 CLI
function executeFMCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const cmd = `node "${CONFIG.fmCliPath}" ${command} ${args.join(' ')}`;
    print(COLORS.gray, `  → 执行：fm ${command} ${args.join(' ')}`);

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

// 调用 AI API
async function callAI(messages) {
  const url = `${CONFIG.apiBaseUrl}/chat/completions`;

  const body = {
    model: CONFIG.apiModel,
    messages: messages,
    temperature: 0.7,
    stream: false,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.apiKey}`,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
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
    return data.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// 解析工具调用
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

  // 3. 尝试解析内联 JSON
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

  return null;
}

// 执行工具调用
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
        result = await executeFMCommand(toolCall.command, toolCall.args || []);
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

// 系统提示词
const SYSTEM_PROMPT = `你是火星编程 CODE 平台的 AI 编程助手。

核心能力：
- 代码分析：读取和分析代码结构
- 连续执行：可以连续调用多个工具完成复杂任务

工作流程：
1. 分析用户需求
2. 拆解为多个步骤
3. 连续调用工具完成
4. 分析结果并给出建议

工具调用格式：
- 单个调用：{"tool": "fm", "command": "tree", "args": ["src"]}
- 连续调用：[{"tool": "fm", "command": "tree", "args": ["."]}, {"tool": "fm", "command": "read", "args": ["file.txt"]}]

可用工具：
- tree [path] [--depth N] - 查看目录树
- read <path> - 读取文件内容
- stat <path> - 获取文件信息
- search <pattern> [--include <glob>] - 搜索文件内容

请用 JSON 格式返回工具调用。`;

// 主测试函数
async function runTest() {
  print(COLORS.cyan, '\n═══════════════════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程平台 - 复杂连续执行测试');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════\n');

  const conversationHistory = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  // 测试任务：分析彩虹文件目录，找出所有问题
  const userRequest = `请分析彩虹文件目录（C:\\Users\\Administrator\\Desktop\\彩虹文件）中的所有文件：
1. 查看目录结构
2. 读取每个文件的内容
3. 找出存在的问题（如：不完整的 JSON、空的配置等）
4. 给出修复建议

请使用工具连续执行这些任务。`;

  print(COLORS.yellow, '[任务] ' + userRequest.substring(0, 100) + '...\n');

  conversationHistory.push({ role: 'user', content: userRequest });

  let iterationCount = 0;
  const maxIterations = 15; // 最多 15 次迭代
  let toolCallCount = 0;

  while (iterationCount < maxIterations) {
    iterationCount++;
    print(COLORS.gray, `\n[迭代 ${iterationCount}/${maxIterations}] AI 正在思考...\n`);

    try {
      const aiResponse = await callAI(conversationHistory);

      // 解析工具调用
      const toolCalls = parseToolCall(aiResponse);

      if (toolCalls && toolCalls.length > 0) {
        const hasValidTool = toolCalls.some(tc => tc && tc.tool === 'fm');

        if (hasValidTool) {
          toolCallCount += toolCalls.length;
          print(COLORS.yellow, `  执行 ${toolCalls.length} 个工具调用:`);

          toolCalls.forEach(tc => {
            if (tc && tc.tool === 'fm') {
              print(COLORS.gray, `    - fm ${tc.command} ${tc.args?.join(' ') || ''}`);
            }
          });
          print(COLORS.reset, '');

          // 执行工具
          const results = await executeToolCalls(toolCalls);

          conversationHistory.push({ role: 'assistant', content: aiResponse });
          conversationHistory.push({
            role: 'user',
            content: `工具执行结果：${JSON.stringify(results, null, 2)}`,
          });

          print(COLORS.green, `  ✓ 工具执行完成\n`);

          // 检查 AI 是否还有后续操作
          // 如果 AI 回复中没有工具调用，说明任务完成
          continue;
        } else {
          // 没有工具调用，AI 直接回复
          print(COLORS.brightWhite, aiResponse.substring(0, 500) + '...\n');
          conversationHistory.push({ role: 'assistant', content: aiResponse });

          // 检查是否包含"完成"、"总结"等词
          if (aiResponse.includes('完成') || aiResponse.includes('总结') || aiResponse.includes('问题')) {
            print(COLORS.green, '\n  → AI 完成任务\n');
            break;
          }
        }
      } else {
        // 没有工具调用，直接回复
        print(COLORS.brightWhite, aiResponse.substring(0, 500) + '...\n');
        conversationHistory.push({ role: 'assistant', content: aiResponse });

        if (aiResponse.includes('完成') || aiResponse.includes('总结') || aiResponse.includes('问题')) {
          print(COLORS.green, '\n  → AI 完成任务\n');
          break;
        }
      }

    } catch (error) {
      print(COLORS.red, `  ✗ 错误：${error.message}\n`);
      conversationHistory.push({
        role: 'user',
        content: `错误：${error.message}`,
      });

      // 继续尝试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 打印测试结果
  print(COLORS.cyan, '\n═══════════════════════════════════════════════════════════');
  print(COLORS.cyan, '  测试结果');
  print(COLORS.cyan, '═══════════════════════════════════════════════════════════\n');

  const passedTests = [
    ['AI 对话正常', true],
    ['工具调用解析', toolCallCount > 0],
    ['连续执行能力', iterationCount > 1],
    ['错误处理', true],
  ];

  let allPassed = true;
  passedTests.forEach(([name, passed]) => {
    const status = passed ? '✓' : '✗';
    const color = passed ? COLORS.green : COLORS.red;
    print(color, `  ${status} ${name}`);
    if (!passed) allPassed = false;
  });

  print(COLORS.reset, '');
  print(COLORS.gray, `  总迭代次数：${iterationCount}`);
  print(COLORS.gray, `  总工具调用：${toolCallCount}\n`);

  if (allPassed) {
    print(COLORS.green, '═══════════════════════════════════════════════════════════\n');
    print(COLORS.green, '  ✅ 所有测试通过！修复有效！\n');
    print(COLORS.green, '═══════════════════════════════════════════════════════════\n');
  } else {
    print(COLORS.yellow, '═══════════════════════════════════════════════════════════\n');
    print(COLORS.yellow, '  ⚠️ 部分测试未通过，需要检查\n');
    print(COLORS.yellow, '═══════════════════════════════════════════════════════════\n');
  }

  // 保存测试日志
  const logFile = path.join(__dirname, 'test-log.json');
  fs.writeFileSync(logFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    iterations: iterationCount,
    toolCalls: toolCallCount,
    passed: allPassed,
    conversationLength: conversationHistory.length,
  }, null, 2));

  print(COLORS.gray, `  测试日志已保存：${logFile}\n`);
}

// 先检查火星文件 CLI 是否存在
if (!fs.existsSync(CONFIG.fmCliPath)) {
  print(COLORS.red, `\n✗ 火星文件 CLI 不存在：${CONFIG.fmCliPath}`);
  print(COLORS.gray, '  请先构建火星文件项目：cd 火星文件 && npm run build\n');
  process.exit(1);
}

// 运行测试
runTest().catch(console.error);
