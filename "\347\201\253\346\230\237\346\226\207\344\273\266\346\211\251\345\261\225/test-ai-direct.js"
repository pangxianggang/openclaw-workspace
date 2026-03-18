#!/usr/bin/env node

/**
 * 🔴 火星编程 - AI 指导的直接文件修改
 * AI 提供修改建议，Node.js 直接执行
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

async function runOptimize() {
  print(COLORS.cyan, '\n══════════════════════════════════════════════');
  print(COLORS.cyan, '  火星编程 - AI 指导优化');
  print(COLORS.cyan, '══════════════════════════════════════════════\n');

  // 读取文件
  const content = fs.readFileSync(CONFIG.targetFile, 'utf-8');
  const lines = content.split('\n');

  print(COLORS.green, `✓ 文件已加载：${lines.length} 行\n`);

  // 让 AI 分析并提供修改建议
  const systemPrompt = `你是前端优化专家。任务：分析 HTML 文件并提供具体的修改建议。

请输出 JSON 格式的修改列表，每个修改包含：
{
  "search": "要查找的原文本（最多 2 行）",
  "replace": "替换后的新文本"
}

返回格式：{"modifications": [{"search": "...", "replace": "..."}]}`;

  // 读取更多文件内容供 AI 分析
  const sampleContent = lines.slice(0, 200).join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `分析以下 HTML 代码，提供 3-5 个视觉优化建议，直接给 JSON：\n\n${sampleContent}...(前 200 行)` }
  ];

  print(COLORS.dim, '💭 AI 正在分析...\n');

  const aiResponse = await callAI(messages);
  print(COLORS.yellow, 'AI 建议:\n');
  console.log(aiResponse);

  // 尝试解析 JSON - 多种策略
  let modifications = [];

  // 策略 1: ```json 代码块
  const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      modifications = parsed.modifications || parsed;
    } catch (e) {}
  }

  // 策略 2: 直接 JSON 对象
  if (modifications.length === 0) {
    const directJsonMatch = aiResponse.match(/\{[\s\S]*"modifications"[\s\S]*\}/);
    if (directJsonMatch) {
      try {
        const parsed = JSON.parse(directJsonMatch[0]);
        modifications = parsed.modifications || [];
      } catch (e) {}
    }
  }

  // 策略 3: JSON 数组
  if (modifications.length === 0) {
    const arrayMatch = aiResponse.match(/\[[\s\S]*"search"[\s\S]*\]/);
    if (arrayMatch) {
      try {
        modifications = JSON.parse(arrayMatch[0]);
      } catch (e) {}
    }
  }

  if (modifications.length === 0) {
    print(COLORS.yellow, '没有找到有效的修改建议');
    return;
  }

  print(COLORS.green, `\n找到 ${modifications.length} 个修改建议\n`);

  // 执行修改
  let modifiedContent = content;
  let successCount = 0;

  for (const mod of modifications) {
    if (!mod.search || !mod.replace) continue;

    if (modifiedContent.includes(mod.search)) {
      modifiedContent = modifiedContent.replace(mod.search, mod.replace);
      print(COLORS.green, `  ✓ 应用：${mod.search.substring(0, 30)}...`);
      successCount++;
    } else {
      print(COLORS.yellow, `  ⚠ 跳过（未找到）：${mod.search.substring(0, 30)}...`);
    }
  }

  if (successCount > 0) {
    // 保存文件
    fs.writeFileSync(CONFIG.targetFile, modifiedContent, 'utf-8');
    print(COLORS.green, `\n✓ 成功应用 ${successCount} 个修改\n`);
  } else {
    print(COLORS.yellow, '\n没有应用任何修改\n');
  }
}

runOptimize().catch(console.error);
