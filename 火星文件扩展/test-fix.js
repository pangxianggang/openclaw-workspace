#!/usr/bin/env node

/**
 * 🔴 测试火星编程平台 - 直接修复 caihang.html
 * 要求：AI 直接使用 patch 命令修复文件，不要输出代码
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  fmCliPath: path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js'),
  workspace: 'C:\\Users\\Administrator\\Desktop',
  apiKey: 'sk-sp-cec7682a7c994e489716da0ad751ce1e',
  apiModel: 'qwen3.5-plus',
  apiBaseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
};

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

function executeFMCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const cmd = `node "${CONFIG.fmCliPath}" ${command} ${args.join(' ')}`;
    print(COLORS.gray, `  → fm ${command} ${args.join(' ')}`);

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
        resolve(JSON.parse(stdout.trim()));
      } catch (e) {
        resolve({ raw: stdout });
      }
    });
  });
}

async function callAI(messages) {
  const url = `${CONFIG.apiBaseUrl}/chat/completions`;
  const body = {
    model: CONFIG.apiModel,
    messages,
    temperature: 0.3,
    max_tokens: 500,
  };
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CONFIG.apiKey}`,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API 错误：${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function parseToolCall(content) {
  if (!content) return null;

  // 尝试解析 JSON 代码块
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  // 尝试解析内联 JSON
  const inlineMatch = content.match(/\{"tool":\s*"fm",\s*"command":\s*"[^}]+\}/);
  if (inlineMatch) {
    try {
      return [JSON.parse(inlineMatch[0])];
    } catch (e) {}
  }

  return null;
}

async function executeToolCalls(toolCalls) {
  if (!toolCalls || toolCalls.length === 0) return null;

  const results = [];
  for (const tc of toolCalls) {
    if (!tc || !tc.tool) {
      results.push({ error: '无效工具' });
      continue;
    }
    try {
      const result = await executeFMCommand(tc.command, tc.args || []);
      results.push(result);
    } catch (error) {
      results.push({ error: error.message });
    }
  }
  return results;
}

// 主函数
async function runFix() {
  print(COLORS.cyan, '\n═══════════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 - 修复 caihang.html');
  print(COLORS.cyan, '═══════════════════════════════════════════════════\n');

  // 系统提示词 - 强调直接修复
  const systemPrompt = `你是编程助手。任务：修复 caihang.html 文件的语法错误。

规则：
1. 不要输出完整代码
2. 不要创建脚本
3. 直接使用 patch 工具修复
4. 格式：{"tool": "fm", "command": "patch", "args": ["caihang.html", "原文本", "新文本"]}

文件位置：C:\\Users\\Administrator\\Desktop\\caihang.html`;

  const history = [{ role: 'system', content: systemPrompt }];

  // 第 1 步：读取文件分析问题
  print(COLORS.yellow, '[步骤 1] 读取文件分析问题...\n');
  history.push({ role: 'user', content: '读取 caihang.html 文件，找出语法错误，然后直接使用 patch 命令修复。不要输出代码，直接给工具调用。' });

  let iterations = 0;
  const maxIterations = 10;
  let toolCount = 0;

  while (iterations < maxIterations) {
    iterations++;
    print(COLORS.gray, `[迭代 ${iterations}/${maxIterations}] AI 思考...\n`);

    try {
      const aiResponse = await callAI(history);
      const toolCalls = parseToolCall(aiResponse);

      if (toolCalls && toolCalls.length > 0 && toolCalls[0].tool === 'fm') {
        toolCount += toolCalls.length;
        print(COLORS.yellow, `  执行工具：${toolCalls.map(t => t.command).join(', ')}\n`);

        const results = await executeToolCalls(toolCalls);
        history.push({ role: 'assistant', content: aiResponse });
        history.push({ role: 'user', content: `结果：${JSON.stringify(results).substring(0, 500)}` });

        print(COLORS.green, '  ✓ 执行完成\n');

        // 检查是否完成
        if (aiResponse.includes('完成') || aiResponse.includes('修复') || results.some(r => r.error)) {
          print(COLORS.brightWhite, aiResponse.substring(0, 300) + '\n');
        }

        // 如果是 patch 命令，认为修复完成
        if (toolCalls.some(t => t.command === 'patch')) {
          print(COLORS.green, '\n  ✓ 文件已修复！\n');
          break;
        }
        continue;
      }

      // AI 直接回复
      print(COLORS.brightWhite, aiResponse.substring(0, 500) + '\n');
      history.push({ role: 'assistant', content: aiResponse });

      if (aiResponse.includes('修复完成') || aiResponse.includes('patch')) {
        break;
      }

    } catch (error) {
      print(COLORS.red, `  ✗ 错误：${error.message}\n`);
    }
  }

  // 结果
  print(COLORS.cyan, '\n═══════════════════════════════════════════════════');
  print(COLORS.cyan, '  测试结果');
  print(COLORS.cyan, '═══════════════════════════════════════════════════\n');
  print(COLORS.gray, `  迭代次数：${iterations}\n`);
  print(COLORS.gray, `  工具调用：${toolCount}\n`);

  // 保存日志
  fs.writeFileSync(
    path.join(__dirname, 'test-fix-log.json'),
    JSON.stringify({ iterations, toolCount, timestamp: new Date().toISOString() }, null, 2)
  );
}

// 检查文件
const filePath = path.join(CONFIG.workspace, 'caihang.html');
if (!fs.existsSync(filePath)) {
  print(COLORS.red, `✗ 文件不存在：${filePath}`);
  process.exit(1);
}
print(COLORS.green, `✓ 文件存在：${filePath}\n`);

runFix().catch(console.error);
