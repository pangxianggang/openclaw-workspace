#!/usr/bin/env node

/**
 * 🔴 连续执行测试脚本 - 修复版
 * 测试 AI 连续调用工具的能力
 */

const { exec } = require('child_process');
const path = require('path');

const CONFIG = {
  fmCliPath: path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js'),
  workspace: 'C:\\Users\\Administrator\\Desktop',
};

// 颜色输出
const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function print(color, text) {
  console.log(`${color}${text}${COLORS.reset}`);
}

// 执行火星文件 CLI
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
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (e) {
        resolve({ raw: stdout });
      }
    });
  });
}

// 模拟连续执行测试
async function runTest() {
  print(COLORS.cyan, '\n═══════════════════════════════════════');
  print(COLORS.cyan, '  火星文件连续执行测试');
  print(COLORS.cyan, '═══════════════════════════════════════\n');

  try {
    // 测试 1：查看目录
    print(COLORS.yellow, '[测试 1] 查看彩虹文件目录...\n');
    const treeResult = await executeFMCommand('tree', ['彩虹文件', '--depth', '2']);
    print(COLORS.green, '✓ 目录查看成功\n');
    console.log(JSON.stringify(treeResult, null, 2).substring(0, 500) + '...\n');

    // 测试 2：读取文件
    print(COLORS.yellow, '[测试 2] 读取文件...\n');
    const files = treeResult.files || [];
    if (files.length > 0) {
      const firstFile = files[0].name;
      const readResult = await executeFMCommand('read', ['彩虹文件/' + firstFile]);
      print(COLORS.green, '✓ 文件读取成功\n');
      console.log(readResult.content?.substring(0, 300) || readResult.raw?.substring(0, 300) || '无内容');
      console.log('');
    }

    // 测试 3：搜索
    print(COLORS.yellow, '[测试 3] 搜索文件...\n');
    const searchResult = await executeFMCommand('search', ['test', '--include', '*.txt']);
    print(COLORS.green, '✓ 搜索完成\n');
    print(COLORS.gray, `找到 ${searchResult.count || 0} 个匹配结果\n`);

    print(COLORS.green, '\n═══════════════════════════════════════');
    print(COLORS.green, '  所有测试通过！');
    print(COLORS.green, '═══════════════════════════════════════\n');

  } catch (error) {
    print(COLORS.red, `\n✗ 测试失败：${error.message}\n`);
  }
}

runTest().catch(console.error);
