#!/usr/bin/env node

/**
 * 🔴 火星编程 - 修复闪烁并改为黑色彩虹屁背景
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  apiKey: 'sk-sp-cec7682a7c994e489716da0ad751ce1e',
  apiModel: 'qwen3.5-plus',
  apiBaseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
  targetFile: 'C:\\Users\\Administrator\\Desktop\\caihang.html',
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

async function callAI(messages) {
  const url = `${CONFIG.apiBaseUrl}/chat/completions`;
  const body = {
    model: CONFIG.apiModel,
    messages,
    temperature: 0.3,
    max_tokens: 1200,
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

// 模糊查找并替换
function fuzzyReplace(content, search, replace) {
  // 策略 1: 精确匹配
  if (content.includes(search)) {
    return { success: true, content: content.replace(search, replace) };
  }

  // 策略 2: 单行匹配
  const searchLines = search.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  if (searchLines.length > 0) {
    for (const sl of searchLines) {
      if (content.includes(sl)) {
        const replaceLines = replace.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let newContent = content;
        for (const rl of replaceLines) {
          newContent = newContent.replace(sl, rl);
        }
        return { success: true, content: newContent };
      }
    }
  }

  return { success: false, content };
}

async function runFix() {
  print(COLORS.cyan, '\n══════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 - 修复闪烁 + 黑色彩虹屁背景');
  print(COLORS.cyan, '══════════════════════════════════════════════\n');

  // 读取文件
  let content = fs.readFileSync(CONFIG.targetFile, 'utf-8');
  const totalLines = content.split('\n').length;

  print(COLORS.green, `✓ 文件已加载：${totalLines} 行\n`);
  print(COLORS.dim, '💭 AI 正在分析闪烁问题并修复...\n');

  const systemPrompt = `你是前端修复专家。用户反馈：
1. 网页一直闪烁，需要修复
2. 把背景改成黑色彩虹屁效果（黑色背景 + 彩虹色气体/烟雾效果）

请分析代码找出闪烁原因并提供修复方案，同时修改背景为黑色彩虹屁效果。

闪烁可能原因：
- 动画冲突（多个动画同时修改同一属性）
- 动画时间/延迟问题
- transform 和 opacity 冲突
- 层叠上下文问题

黑色彩虹屁效果：
- 背景改为纯黑或深灰色
- 添加彩虹色烟雾/气体效果（使用径向渐变或滤镜）
- 气体缓慢飘动效果

返回 JSON 格式：{"fixes": [{"description": "修复描述", "search": "原代码", "replace": "新代码"}]}

注意：search 必须是文件中实际存在的代码！`;

  const lines = content.split('\n');
  const styleSection = lines.slice(0, 400).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `修复闪烁问题并改成黑色彩虹屁背景。提供具体修改，直接给 JSON：\n\n${styleSection}...` }
  ];

  try {
    const aiResponse = await callAI(messages);

    // 解析 JSON
    let fixes = [];
    let jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        fixes = parsed.fixes || parsed;
      } catch (e) {}
    }

    if (fixes.length === 0) {
      jsonMatch = aiResponse.match(/\{[\s\S]*"fixes"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          fixes = parsed.fixes || [];
        } catch (e) {}
      }
    }

    if (fixes.length === 0) {
      print(COLORS.yellow, 'AI 没有返回有效的修复建议');
      console.log(aiResponse.substring(0, 500));
      return;
    }

    print(COLORS.green, `AI 建议 ${fixes.length} 个修复方案:\n`);

    let successCount = 0;
    let failCount = 0;

    for (const fix of fixes) {
      if (!fix.search || !fix.replace) continue;

      const desc = fix.description || fix.search.substring(0, 25) + '...';
      print(COLORS.dim, `  尝试：${desc}`);

      const result = fuzzyReplace(content, fix.search, fix.replace);

      if (result.success) {
        content = result.content;
        print(COLORS.green, `    ✓ 成功应用`);
        successCount++;
      } else {
        print(COLORS.yellow, `    ⚠ 未匹配`);
        failCount++;
      }
    }

    print(COLORS.cyan, `\n══════════════════════════════════════════`);
    print(COLORS.cyan, `  修复完成：成功 ${successCount} 个，失败 ${failCount} 个`);
    print(COLORS.cyan, `══════════════════════════════════════════\n`);

    if (successCount > 0) {
      fs.writeFileSync(CONFIG.targetFile, content, 'utf-8');
      print(COLORS.green, `✓ 文件已保存到：${CONFIG.targetFile}\n`);
    }

  } catch (error) {
    print(COLORS.red, `错误：${error.message}\n`);
  }
}

if (!fs.existsSync(CONFIG.targetFile)) {
  print(COLORS.red, `✗ 文件不存在：${CONFIG.targetFile}`);
  process.exit(1);
}

runFix().catch(console.error);
