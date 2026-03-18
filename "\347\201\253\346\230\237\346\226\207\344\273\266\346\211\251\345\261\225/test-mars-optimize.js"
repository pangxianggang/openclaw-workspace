#!/usr/bin/env node

/**
 * 🔴 火星编程 - 优化桌面 caihang.html 设计
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

// 模糊查找并替换（增强版）
function fuzzyReplace(content, search, replace) {
  // 策略 1: 精确匹配
  if (content.includes(search)) {
    return { success: true, content: content.replace(search, replace) };
  }

  // 策略 2: 忽略空白匹配
  const normalize = (s) => s.replace(/\s+/g, ' ').trim();
  const normSearch = normalize(search);

  const lines = content.split('\n');
  for (let i = 0; i < lines.length - 5; i++) {
    const window = lines.slice(i, Math.min(i + 10, lines.length)).join('\n');
    if (normalize(window).includes(normSearch.substring(0, 100))) {
      // 找到匹配
      const indent = lines[i].match(/^\s*/)[0];
      const indentedReplace = replace.split('\n').map(l => indent + l).join('\n');
      return { success: true, content: content.replace(window, indentedReplace + lines.slice(i + 5, Math.min(i + 10, lines.length)).join('\n')) };
    }
  }

  // 策略 3: 单行匹配
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

async function runOptimize() {
  print(COLORS.cyan, '\n══════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 - 优化 caihang.html 设计');
  print(COLORS.cyan, '══════════════════════════════════════════════\n');

  // 读取文件
  let content = fs.readFileSync(CONFIG.targetFile, 'utf-8');
  const totalLines = content.split('\n').length;

  print(COLORS.green, `✓ 文件已加载：${totalLines} 行\n`);
  print(COLORS.dim, '💭 AI 正在分析并优化设计...\n');

  // 让 AI 分析并提供优化建议
  const systemPrompt = `你是前端设计和动画专家。任务：深度优化 HTML 文件的视觉效果，让它更漂亮、更现代、更有科技感。

请分析代码并提供具体修改，每个修改包含：
- description: 简短描述（20 字以内）
- search: 要查找的原文本（必须简短，1 行以内，约 50 字符）
- replace: 替换后的新文本

可以优化的方面：
1. 渐变动画（颜色更丰富、过渡更平滑）
2. 粒子效果（更多粒子、更自然的运动）
3. 光影效果（发光、阴影、反射）
4. 交互效果（鼠标悬停、点击反馈）
5. 动画流畅度（缓动函数、时间曲线）
6. 色彩搭配（更协调的配色方案）

重要：search 字段必须是文件中实际存在的连续文本，且要简短（1 行）！

返回纯 JSON 格式：{"modifications": [{"description": "...", "search": "...", "replace": "..."}]}`;

  // 读取文件的关键部分供 AI 分析
  const lines = content.split('\n');
  const styleSection = lines.slice(0, 300).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `深度优化以下 HTML 的视觉效果，让它更漂亮更有科技感。提供 10-15 个具体修改，直接给 JSON：\n\n${styleSection}...(前 300 行)` }
  ];

  try {
    const aiResponse = await callAI(messages);

    // 解析 JSON - 多种策略
    let modifications = [];

    // 策略 1: ```json 代码块
    let jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        modifications = parsed.modifications || parsed;
      } catch (e) {}
    }

    // 策略 2: 完整 JSON 对象
    if (modifications.length === 0) {
      jsonMatch = aiResponse.match(/\{[\s\S]*"modifications"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          modifications = parsed.modifications || [];
        } catch (e) {}
      }
    }

    // 策略 3: 直接数组
    if (modifications.length === 0) {
      jsonMatch = aiResponse.match(/\[[\s\S]*\{[\s\S]*"search"[\s\S]*\}[\s\S]*\]/);
      if (jsonMatch) {
        try {
          modifications = JSON.parse(jsonMatch[0]);
        } catch (e) {}
      }
    }

    if (modifications.length === 0) {
      print(COLORS.yellow, 'AI 没有返回有效的修改建议');
      console.log(aiResponse.substring(0, 500));
      return;
    }

    print(COLORS.green, `AI 建议 ${modifications.length} 个优化方案:\n`);

    // 执行修改
    let successCount = 0;
    let failCount = 0;

    for (const mod of modifications) {
      if (!mod.search || !mod.replace) continue;

      const desc = mod.description || mod.search.substring(0, 25) + '...';
      print(COLORS.dim, `  尝试：${desc}`);

      const result = fuzzyReplace(content, mod.search, mod.replace);

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
    print(COLORS.cyan, `  优化完成：成功 ${successCount} 个，失败 ${failCount} 个`);
    print(COLORS.cyan, `══════════════════════════════════════════\n`);

    if (successCount > 0) {
      // 保存文件
      fs.writeFileSync(CONFIG.targetFile, content, 'utf-8');
      print(COLORS.green, `✓ 文件已保存到：${CONFIG.targetFile}\n`);
    }

  } catch (error) {
    print(COLORS.red, `错误：${error.message}\n`);
  }
}

// 检查文件
if (!fs.existsSync(CONFIG.targetFile)) {
  print(COLORS.red, `✗ 文件不存在：${CONFIG.targetFile}`);
  process.exit(1);
}

runOptimize().catch(console.error);
