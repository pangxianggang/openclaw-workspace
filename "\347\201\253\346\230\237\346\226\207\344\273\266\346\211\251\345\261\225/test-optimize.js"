#!/usr/bin/env node

/**
 * 🔴 火星编程 - 优化 caihang.html 设计
 * 支持自动 patch 命令转换
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CONFIG = {
  fmCliPath: path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js'),
  workspace: 'C:\\Users\\Administrator\\Desktop\\火星文件扩展',
  targetFile: 'caihang.html',
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
  red: '\x1b[31m',
};

function print(color, text) {
  console.log(`${color}${text}${COLORS.reset}`);
}

function executeFMCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const cmd = `node "${CONFIG.fmCliPath}" ${command} ${args.join(' ')}`;
    print(COLORS.dim, `  → fm ${command} ${args.join(' ')}`);

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

// 执行 patch 命令（自动获取版本并转换为 apply 命令）
async function executePatchCommand(filePath, originalText, newText) {
  try {
    // 第 1 步：获取文件版本
    print(COLORS.dim, `  → 获取文件版本...`);
    const versionResult = await executeFMCommand('read', [filePath, '-s', '1', '-e', '1']);
    const version = versionResult.version;

    if (!version) {
      throw new Error('无法获取文件版本');
    }

    print(COLORS.dim, `  → 版本号：${version.substring(0, 20)}...`);

    // 第 2 步：构建 apply 命令
    const ops = [{
      type: 'replace_range',
      target: originalText,
      replacement: newText
    }];

    const opsJson = JSON.stringify(ops);

    // 第 3 步：执行 apply 命令
    print(COLORS.dim, `  → 应用修改...`);
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

async function callAI(messages) {
  const url = `${CONFIG.apiBaseUrl}/chat/completions`;
  const body = {
    model: CONFIG.apiModel,
    messages,
    temperature: 0.3,
    max_tokens: 600,
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

  // 策略 1：```json 代码块
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  // 策略 2：``` 代码块
  const codeBlockMatch = content.match(/```\s*([\s\S]+?)\s*```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }

  // 策略 3：内联 JSON 对象
  const inlineMatch = content.match(/\{"tool":\s*"fm"[^}]+\}/);
  if (inlineMatch) {
    try {
      return [JSON.parse(inlineMatch[0])];
    } catch (e) {}
  }

  // 策略 4：JSON 数组
  let bracketCount = 0;
  let startIndex = -1;
  let endIndex = -1;
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
      if (Array.isArray(parsed)) return parsed;
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
      let result;
      if (tc.tool === 'fm') {
        if (tc.command === 'patch') {
          const [filePath, originalText, newText] = tc.args || [];
          result = await executePatchCommand(filePath, originalText, newText);
        } else {
          result = await executeFMCommand(tc.command, tc.args || []);
        }
      } else {
        result = { error: `未知工具：${tc.tool}` };
      }
      results.push(result);
    } catch (error) {
      results.push({ error: error.message });
    }
  }
  return results;
}

async function runOptimize() {
  print(COLORS.cyan, '\n══════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 - 优化 caihang.html 设计');
  print(COLORS.cyan, '══════════════════════════════════════════════\n');

  const systemPrompt = `你是编程助手。任务：优化 caihang.html 文件的视觉效果和代码设计。

规则：
1. 不要输出完整代码
2. 使用 patch 工具修改文件
3. 格式：{"tool": "fm", "command": "patch", "args": ["caihang.html", "短原文本", "新文本"]}
4. 原文本必须简短（1-3 行），确保精确匹配
5. 可以添加更多炫酷的视觉效果（渐变、粒子、光影等）
6. 简洁！直接给 JSON 工具调用！`;

  const history = [{ role: 'system', content: systemPrompt }];

  print(COLORS.yellow, '任务：优化 caihang.html 的视觉设计\n');
  print(COLORS.dim, '💭 AI 正在思考处理中...\n');

  history.push({
    role: 'user',
    content: '读取 caihang.html 文件，分析当前设计，然后用 patch 命令优化视觉效果。可以添加：渐变动画、粒子效果、光影效果等。直接给 JSON 工具调用。'
  });

  let iterations = 0;
  const maxIterations = 15;
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

        // 检查是否有成功的 patch 操作
        const successfulPatch = toolCalls.some(t => t.command === 'patch') &&
                                results.some(r => r && !r.error && r.success);
        if (successfulPatch) {
          print(COLORS.green, '\n  ✓ 正在优化设计...\n');
        } else if (toolCalls.some(t => t.command === 'patch')) {
          print(COLORS.yellow, '\n  ⚠ patch 操作结果：' + JSON.stringify(results).substring(0, 100) + '...\n');
        }
        continue;
      }

      print(COLORS.brightWhite, aiResponse.substring(0, 400) + '\n');
      history.push({ role: 'assistant', content: aiResponse });

      if (aiResponse.includes('完成') || aiResponse.includes('优化完成')) break;

    } catch (error) {
      print(COLORS.red, `  错误：${error.message}\n`);
    }
  }

  print(COLORS.cyan, '\n══════════════════════════════════════════');
  print(COLORS.cyan, `  结果：迭代${iterations}次，工具调用${toolCount}次`);
  print(COLORS.cyan, '══════════════════════════════════════════\n');
}

// 检查文件
const filePath = path.join(CONFIG.workspace, 'caihang.html');
if (!fs.existsSync(filePath)) {
  print(COLORS.red, `✗ 文件不存在：${filePath}`);
  process.exit(1);
}
print(COLORS.green, `✓ 文件存在：${filePath}\n`);

runOptimize().catch(console.error);
