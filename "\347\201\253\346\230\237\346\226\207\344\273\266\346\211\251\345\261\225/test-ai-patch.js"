#!/usr/bin/env node

/**
 * 🔴 火星编程 - 测试 AI 直接修复代码
 * 简化的测试版本
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  fmCliPath: path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js'),
  workspace: 'C:\\Users\\Administrator\\Desktop\\火星文件扩展',
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
  red: '\x1b[31m',
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
    temperature: 0.3,
    max_tokens: 800,
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
  if (!content) return null;

  // 尝试解析 ```json 代码块
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  // 尝试解析内联 JSON
  const inlineMatch = content.match(/\{"tool":\s*"fm"[^}]+\}/);
  if (inlineMatch) {
    try {
      return [JSON.parse(inlineMatch[0])];
    } catch (e) {}
  }

  return null;
}

async function executePatchCommand(filePath, searchText, replaceText) {
  try {
    // 获取版本
    const versionResult = await executeFMCommand('read', [filePath, '-s', '1', '-e', '1']);
    const version = versionResult.version;

    if (!version) {
      return { error: '无法获取文件版本' };
    }

    // 执行 apply
    const ops = [{
      type: 'replace_range',
      target: searchText,
      replacement: replaceText
    }];

    const result = await executeFMCommand('apply', [
      filePath,
      '--ops', JSON.stringify(ops),
      '--base-version', version,
      '--no-dry-run'
    ]);

    return result;
  } catch (error) {
    return { error: error.message };
  }
}

async function executeToolCalls(toolCalls) {
  const results = [];
  for (const tc of toolCalls) {
    if (!tc || !tc.tool) {
      results.push({ error: '无效工具' });
      continue;
    }

    if (tc.tool === 'fm' && tc.command === 'patch') {
      const [filePath, searchText, replaceText] = tc.args || [];
      print(COLORS.dim, `  → patch "${searchText.substring(0, 30)}..." → "${replaceText.substring(0, 30)}..."`);
      const result = await executePatchCommand(filePath, searchText, replaceText);
      results.push(result);
    } else if (tc.tool === 'fm') {
      print(COLORS.dim, `  → ${tc.command} ${tc.args?.join(' ')}`);
      const result = await executeFMCommand(tc.command, tc.args || []);
      results.push(result);
    } else {
      results.push({ error: `未知工具：${tc.tool}` });
    }
  }
  return results;
}

async function runTest() {
  print(COLORS.cyan, '\n══════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 - 代码优化测试');
  print(COLORS.cyan, '══════════════════════════════════════════════\n');

  const systemPrompt = `你是编程助手。任务：优化 caihang.html 文件。

重要规则：
1. 使用 patch 工具：{"tool": "fm", "command": "patch", "args": ["caihang.html", "搜索文本", "替换文本"]}
2. 搜索文本必须是文件中存在的连续文本（1-2 行）
3. 不要输出代码，直接给 JSON 工具调用
4. 简洁！`;

  const history = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: '优化 caihang.html 的视觉效果，添加更多动画和特效。直接给 patch 工具调用。' }
  ];

  let iterations = 0;
  const maxIterations = 10;
  let successCount = 0;
  const usedPatches = new Set();

  while (iterations < maxIterations) {
    iterations++;
    print(COLORS.dim, `[迭代 ${iterations}/${maxIterations}] 处理中...`);

    try {
      const aiResponse = await callAI(history);
      const toolCalls = parseToolCall(aiResponse);

      if (!toolCalls) {
        print(COLORS.green, aiResponse.substring(0, 200));
        if (aiResponse.includes('完成') || aiResponse.includes('优化')) break;
        continue;
      }

      const results = await executeToolCalls(toolCalls);

      // 检查成功
      results.forEach((r, i) => {
        if (r && r.success) {
          successCount++;
          print(COLORS.green, `  ✓ 操作 ${i+1} 成功`);
        } else if (r && r.error) {
          print(COLORS.yellow, `  ⚠ 操作 ${i+1}: ${r.error.substring(0, 50)}`);
        }
      });

      // 反馈给 AI
      history.push({ role: 'assistant', content: aiResponse });
      history.push({ role: 'user', content: `结果：${JSON.stringify(results).substring(0, 200)}` });

      if (successCount >= 3) {
        print(COLORS.green, '\n✓ 完成 3 次成功修改！\n');
        break;
      }

    } catch (error) {
      print(COLORS.red, `错误：${error.message}`);
    }
  }

  print(COLORS.cyan, '\n══════════════════════════════════════════');
  print(COLORS.cyan, `  结果：迭代${iterations}次，成功${successCount}次`);
  print(COLORS.cyan, '══════════════════════════════════════════\n');
}

// 检查文件
const filePath = path.join(CONFIG.workspace, 'caihang.html');
if (!fs.existsSync(filePath)) {
  print(COLORS.red, `✗ 文件不存在：${filePath}`);
  process.exit(1);
}

runTest().catch(console.error);
