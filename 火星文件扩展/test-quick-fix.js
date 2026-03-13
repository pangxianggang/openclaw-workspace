#!/usr/bin/env node

/**
 * 🔴 快速测试 - 火星编程修复 caihang.html
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
  dim: '\x1b[2m',
  brightWhite: '\x1b[97m',
};

function print(color, text) {
  console.log(`${color}${text}${COLORS.reset}`);
}

function executeFMCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const cmd = `node "${CONFIG.fmCliPath}" ${command} ${args.join(' ')}`;
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
    temperature: 0.2,
    max_tokens: 400,
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

  if (!response.ok) throw new Error(`API 错误：${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

function parseToolCall(content) {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }
  const inlineMatch = content.match(/\{"tool":\s*"fm"[^}]+\}/);
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
      results.push(await executeFMCommand(tc.command, tc.args || []));
    } catch (error) {
      results.push({ error: error.message });
    }
  }
  return results;
}

async function runFix() {
  print(COLORS.cyan, '\n══════════════════════════════════════════════');
  print(COLORS.cyan, '  快速测试 - 修复 caihang.html');
  print(COLORS.cyan, '══════════════════════════════════════════════\n');

  const systemPrompt = `你是编程助手。任务：修复 caihang.html 的语法错误。

规则：
1. 不要输出完整代码
2. 直接用 patch 工具修复
3. 格式：{"tool": "fm", "command": "patch", "args": ["caihang.html", "原文本", "新文本"]}
4. 简洁！不要解释！`;

  const history = [{ role: 'system', content: systemPrompt }];

  print(COLORS.yellow, '任务：修复 caihang.html 文件\n');
  print(COLORS.dim, '💭 AI 正在思考处理中...\n');

  history.push({
    role: 'user',
    content: '读取 caihang.html 第 1575-1600 行，找出问题，然后用 patch 命令修复。直接给 JSON 工具调用，不要解释。'
  });

  let iterations = 0;
  const maxIterations = 10;
  let toolCount = 0;

  while (iterations < maxIterations) {
    iterations++;

    // 第 9 次迭代确认
    if (iterations === 9) {
      print(COLORS.yellow, '\n═══════════════════════════════════════════');
      print(COLORS.yellow, '  已执行 9 次迭代，是否继续？');
      print(COLORS.yellow, '═══════════════════════════════════════════');
      const choice = await new Promise((resolve) => {
        process.stdin.once('data', (data) => {
          resolve(data.toString().trim().toLowerCase());
        });
        print(COLORS.cyan, '  [B] 继续  [N] 停止：');
      });
      if (choice === 'n' || choice === 'stop') {
        print(COLORS.yellow, '\n  已停止\n');
        break;
      }
    }

    if (iterations > 1) print(COLORS.dim, `  [迭代 ${iterations}] 处理中...`);

    try {
      const aiResponse = await callAI(history);
      const toolCalls = parseToolCall(aiResponse);

      if (toolCalls && toolCalls.some(t => t.tool === 'fm')) {
        toolCount += toolCalls.length;

        if (iterations === 1) {
          toolCalls.forEach(tc => {
            print(COLORS.dim, `  → ${tc.command} ${tc.args?.join(' ') || ''}`);
          });
        }

        const results = await executeToolCalls(toolCalls);
        history.push({ role: 'assistant', content: aiResponse });
        history.push({ role: 'user', content: `结果：${JSON.stringify(results).substring(0, 300)}` });

        // 如果是 patch 命令，认为修复完成
        if (toolCalls.some(t => t.command === 'patch')) {
          print(COLORS.green, '\n  ✓ 文件已修复！\n');
          break;
        }
        continue;
      }

      print(COLORS.brightWhite, aiResponse.substring(0, 300) + '\n');
      history.push({ role: 'assistant', content: aiResponse });

      if (aiResponse.includes('完成') || aiResponse.includes('修复')) break;

    } catch (error) {
      print(COLORS.yellow, `  错误：${error.message}\n`);
    }
  }

  print(COLORS.cyan, '\n══════════════════════════════════════════');
  print(COLORS.cyan, `  结果：迭代${iterations}次，工具调用${toolCount}次`);
  print(COLORS.cyan, '══════════════════════════════════════════\n');
}

// 检查文件
const filePath = path.join(CONFIG.workspace, 'caihang.html');
if (!fs.existsSync(filePath)) {
  print(COLORS.yellow, `文件不存在：${filePath}`);
  process.exit(1);
}

runFix().catch(console.error);
