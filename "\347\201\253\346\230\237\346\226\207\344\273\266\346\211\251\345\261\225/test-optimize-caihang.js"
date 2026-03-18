/**
 * 让 AI 优化 caihang.html - 白色简约主题
 */

const { execSync } = require('child_process');
const path = require('path');

// 火星文件 CLI 路径
const FM_CLI = path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js');

// 工作区
const WORKSPACE = 'C:\\Users\\Administrator\\Desktop';

// 执行火星文件命令
function execFM(command, args) {
    const cmd = `node "${FM_CLI}" ${command} --workspace "${WORKSPACE}" ${args.join(' ')}`;
    console.log('执行:', cmd);
    return JSON.parse(execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }));
}

// 读取 caihang.html
console.log('📖 读取 caihang.html...');
const readResult = execFM('read', ['"火星文件扩展/caihang.html"']);
console.log('文件已读取，大小:', readResult.content?.length || '未知', '字节');

// 调用 AI 优化
const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'qwen3.5-plus';

if (!AI_API_KEY) {
    console.error('❌ 未配置 AI_API_KEY 环境变量');
    process.exit(1);
}

const systemPrompt = `你是一个专业的网页设计师。你的任务是优化网页设计。

当前任务：将 caihang.html 改成白色简约主题

要求：
1. 主色调改为白色/浅灰色背景
2. 设计风格简约、干净
3. 保持功能完整
4. 不要输出完整代码，直接用 patch 工具修改

使用 patch 命令格式：
{"tool": "fm", "command": "patch", "args": ["文件路径", "原文本", "新文本"]}`;

const userPrompt = `请把桌面的 caihang.html 改成白色简约主题。分析当前 CSS，修改颜色方案为白色/浅灰背景，字体颜色深色，整体设计简约现代。`;

console.log('🤖 调用 AI 进行优化...');

const response = require('https').request({
    hostname: 'coding.dashscope.aliyuncs.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            const content = result.choices?.[0]?.message?.content || '';
            console.log('AI 响应:', content.substring(0, 500));

            // 尝试解析 JSON 工具调用
            const jsonMatch = content.match(/\{[^}]*"tool"[^}]*\}/s);
            if (jsonMatch) {
                const toolCall = JSON.parse(jsonMatch[0]);
                console.log('工具调用:', JSON.stringify(toolCall, null, 2));
            }
        } catch (e) {
            console.error('解析失败:', e, data);
        }
    });
});

response.on('error', (e) => console.error('请求失败:', e));

const requestBody = JSON.stringify({
    model: AI_MODEL,
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ]
});

response.write(requestBody);
response.end();
