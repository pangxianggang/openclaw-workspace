/**
 * Native Messaging Host Wrapper
 * 处理 Chrome Native Messaging 协议
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 火星文件管理 CLI 路径
const FM_CLI_PATH = path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js');

// 配置
const WORKSPACE_ROOT = process.env.FM_WORKSPACE || process.cwd();
const FM_SERVER_URL = 'http://localhost:8765/rpc';

// 读取消息（Chrome Native Messaging 协议）
async function readMessage() {
  return new Promise((resolve, reject) => {
    const lengthBuffer = Buffer.alloc(4);
    process.stdin.read(4, lengthBuffer);

    if (lengthBuffer.every(b => b === 0)) {
      resolve(null);
      return;
    }

    const length = lengthBuffer.readUInt32LE(0);
    const messageBuffer = Buffer.alloc(length);
    process.stdin.read(length, messageBuffer);

    try {
      const message = JSON.parse(messageBuffer.toString('utf8'));
      resolve(message);
    } catch (e) {
      reject(e);
    }
  });
}

// 发送消息
function sendMessage(message) {
  const messageStr = JSON.stringify(message);
  const messageBuffer = Buffer.from(messageStr, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(messageBuffer.length, 0);

  process.stdout.write(lengthBuffer);
  process.stdout.write(messageBuffer);
}

// 执行火星文件管理命令
async function executeFmCommand(method, params) {
  return new Promise((resolve, reject) => {
    const args = [FM_CLI_PATH, method];

    // 构建命令参数
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'boolean' && value) {
        args.push(`--${key}`);
      } else if (Array.isArray(value)) {
        args.push(`--${key}`, JSON.stringify(value));
      } else if (typeof value === 'object' && value !== null) {
        args.push(`--${key}`, JSON.stringify(value));
      } else {
        args.push(`--${key}`, String(value));
      }
    });

    const child = spawn('node', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: WORKSPACE_ROOT
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          resolve({ raw: stdout });
        }
      } else {
        reject(new Error(stderr || `Command failed with code ${code}`));
      }
    });
  });
}

// 主消息循环
async function main() {
  console.error('[FM Host] Started, workspace:', WORKSPACE_ROOT);

  try {
    while (true) {
      const message = await readMessage();
      if (!message) continue;

      console.error('[FM Host] Received:', JSON.stringify(message));

      try {
        const result = await executeFmCommand(message.method, message.params || {});
        sendMessage({ success: true, data: result });
        console.error('[FM Host] Sent response');
      } catch (error) {
        sendMessage({ success: false, error: error.message });
        console.error('[FM Host] Error:', error.message);
      }
    }
  } catch (error) {
    console.error('[FM Host] Fatal error:', error);
    process.exit(1);
  }
}

main();
