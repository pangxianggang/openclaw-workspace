#!/usr/bin/env node

/**
 * 🔴 火星编程 - AI 指导优化（模糊匹配版）
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  apiKey: 'sk-sp-cec7682a7c994e489716da0ad751ce1e',
  apiModel: 'qwen3.5-plus',
  apiBaseUrl: 'https://coding.dashscope.aliyuncs.com/v1',
  targetFile: 'C:\\Users\\Administrator\\Desktop\\火星文件扩展\\caihang.html',
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
    max_tokens: 1000,
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
  // 去除空白后查找
  const normalizedSearch = search.replace(/\s+/g, '\\s+').replace(/</g, '<').replace(/>/g, '>');
  const regex = new RegExp(normalizedSearch, 'i');

  if (regex.test(content)) {
    return { success: true, content: content.replace(regex, replace) };
  }

  // 尝试精确匹配
  if (content.includes(search)) {
    return { success: true, content: content.replace(search, replace) };
  }

  // 尝试忽略缩进匹配
  const searchLines = search.split('\n').map(l => l.trim()).filter(l => l);
  const contentLines = content.split('\n');

  for (let i = 0; i < contentLines.length - searchLines.length + 1; i++) {
    const match = searchLines.every((sl, idx) => {
      const contentLine = contentLines[i + idx]?.trim();
      return sl === contentLine;
    });

    if (match) {
      // 找到匹配，执行替换
      const replaceLines = replace.split('\n');
      const indent = contentLines[i].match(/^\s*/)[0];
      const indentedReplace = replaceLines.map(l => indent + l).join('\n');

      const newLines = [...contentLines];
      newLines.splice(i, searchLines.length, indentedReplace);
      return { success: true, content: newLines.join('\n') };
    }
  }

  return { success: false, content };
}

async function runOptimize() {
  print(COLORS.cyan, '\n══════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 - AI 模糊匹配优化');
  print(COLORS.cyan, '══════════════════════════════════════════════\n');

  const content = fs.readFileSync(CONFIG.targetFile, 'utf-8');

  print(COLORS.green, `✓ 文件已加载：${content.split('\n').length} 行\n`);

  const systemPrompt = `你是前端优化专家。任务：优化 HTML 文件的视觉效果。

请输出 JSON 格式的修改列表，每个修改包含：
{
  "description": "修改描述",
  "search": "要查找的关键文本（1-2 行，包含独特标识）",
  "replace": "替换后的新文本"
}

返回格式：{"modifications": [{"description": "...", "search": "...", "replace": "..."}]}`;

  // 读取文件的关键部分
  const lines = content.split('\n');
  const sampleContent = lines.slice(0, 150).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `优化以下 HTML 的视觉效果，提供 3-5 个具体修改建议：\n\n${sampleContent}...` }
  ];

  print(COLORS.dim, '💭 AI 正在分析...\n');

  const aiResponse = await callAI(messages);

  // 解析 JSON
  let modifications = [];
  const jsonMatches = [
    aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/),
    aiResponse.match(/\{[\s\S]*"modifications"[\s\S]*\}/),
    aiResponse.match(/\[[\s\S]*"search"[\s\S]*\]/)
  ];

  for (const match of jsonMatches) {
    if (match) {
      try {
        const parsed = JSON.parse(match[1] || match[0]);
        modifications = parsed.modifications || parsed;
        break;
      } catch (e) {}
    }
  }

  if (modifications.length === 0) {
    print(COLORS.yellow, '没有找到有效的修改建议');
    console.log(aiResponse);
    return;
  }

  print(COLORS.green, `找到 ${modifications.length} 个修改建议:\n`);

  let modifiedContent = content;
  let successCount = 0;

  for (const mod of modifications) {
    if (!mod.search || !mod.replace) continue;

    print(COLORS.dim, `  尝试：${mod.description || mod.search.substring(0, 30)}...`);

    const result = fuzzyReplace(modifiedContent, mod.search, mod.replace);

    if (result.success) {
      modifiedContent = result.content;
      print(COLORS.green, `    ✓ 成功`);
      successCount++;
    } else {
      print(COLORS.yellow, `    ⚠ 未找到匹配`);
    }
  }

  if (successCount > 0) {
    fs.writeFileSync(CONFIG.targetFile, modifiedContent, 'utf-8');
    print(COLORS.green, `\n✓ 成功应用 ${successCount} 个修改\n`);
  } else {
    print(COLORS.yellow, '\n没有应用任何修改\n');
  }
}

runOptimize().catch(console.error);
