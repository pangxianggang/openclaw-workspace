#!/usr/bin/env node
/**
 * 测试连续工具调用功能
 */

const { exec } = require('child_process');
const path = require('path');

const FM_CLI = path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js');
const WORKSPACE = 'C:\\Users\\Administrator\\Desktop';

// 执行命令
function execute(command, args) {
  return new Promise((resolve, reject) => {
    const cmd = `node "${FM_CLI}" ${command} ${args.join(' ')}`;
    console.log(`执行：fm ${command} ${args.join(' ')}`);

    exec(cmd, {
      cwd: WORKSPACE,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8',
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

// 测试连续调用
async function testContinuousExecution() {
  console.log('=== 测试连续工具调用 ===\n');

  try {
    // 步骤 1: 查看彩虹文件目录
    console.log('步骤 1: 查看彩虹文件目录');
    const treeResult = await execute('tree', ['彩虹文件', '--depth', '2']);
    console.log('目录结构:', JSON.stringify(treeResult, null, 2));
    console.log();

    // 步骤 2: 读取第一个文件
    console.log('步骤 2: 读取新建文本文档 1.txt');
    const readResult = await execute('read', ['彩虹文件/新建文本文档 1.txt']);
    console.log('文件内容:', JSON.stringify(readResult, null, 2));
    console.log();

    // 步骤 3: 读取第二个文件
    console.log('步骤 3: 读取新建文本文档 (2).txt');
    const readResult2 = await execute('read', ['彩虹文件/新建文本文档 (2).txt']);
    console.log('文件内容:', JSON.stringify(readResult2, null, 2));
    console.log();

    console.log('=== 测试完成 ===');
  } catch (error) {
    console.error('错误:', error.message);
  }
}

testContinuousExecution();
