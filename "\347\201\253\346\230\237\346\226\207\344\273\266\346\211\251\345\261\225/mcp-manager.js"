#!/usr/bin/env node

/**
 * 🔴 MCP 管理器 - 动态管理 MCP 服务器
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// MCP 配置文件路径
const MCP_CONFIG_PATH = path.join(
  process.env.APPDATA || path.join(process.env.HOME, '.config'),
  'mars-platform',
  'mcp-config.json'
);

// 默认配置
const DEFAULT_CONFIG = {
  mcpServers: {}
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, msg) {
  console.log(`${color}${msg}${colors.reset}`);
}

// 加载配置
function loadConfig() {
  try {
    if (fs.existsSync(MCP_CONFIG_PATH)) {
      const content = fs.readFileSync(MCP_CONFIG_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    log(colors.red, `加载配置失败：${e.message}`);
  }

  // 创建默认配置
  const dir = path.dirname(MCP_CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  saveConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

// 保存配置
function saveConfig(config) {
  fs.writeFileSync(MCP_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// 添加 MCP 服务器
async function addMcpServer(name, config) {
  const currentConfig = loadConfig();

  if (currentConfig.mcpServers[name]) {
    log(colors.yellow, `MCP 服务器 "${name}" 已存在，是否覆盖？(y/n)`);
    // 这里由调用者决定是否覆盖
  }

  currentConfig.mcpServers[name] = {
    command: config.command,
    args: config.args || [],
    env: config.env || {},
    description: config.description || '',
    disabled: false,
  };

  saveConfig(currentConfig);
  log(colors.green, `MCP 服务器 "${name}" 已添加`);
  return true;
}

// 删除 MCP 服务器
function removeMcpServer(name) {
  const config = loadConfig();

  if (!config.mcpServers[name]) {
    log(colors.red, `MCP 服务器 "${name}" 不存在`);
    return false;
  }

  delete config.mcpServers[name];
  saveConfig(config);
  log(colors.green, `MCP 服务器 "${name}" 已删除`);
  return true;
}

// 列出所有 MCP 服务器
function listMcpServers() {
  const config = loadConfig();
  const servers = config.mcpServers || {};

  const names = Object.keys(servers);

  if (names.length === 0) {
    log(colors.gray, '暂无 MCP 服务器配置');
    return [];
  }

  log(colors.cyan, `\n已配置的 MCP 服务器 (${names.length}):`);
  log(colors.gray, '═'.repeat(60));

  names.forEach(name => {
    const server = servers[name];
    const status = server.disabled ? '[禁用]' : '[启用]';
    log(colors.reset, `  ${status}  ${colors.cyan}${name}${colors.reset}`);

    if (server.description) {
      log(colors.gray, `     ${server.description}`);
    }
    log(colors.gray, `     命令：${server.command} ${server.args?.join(' ') || ''}`);

    if (server.env && Object.keys(server.env).length > 0) {
      log(colors.gray, `     环境变量：${Object.entries(server.env).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }
    console.log('');
  });

  return names;
}

// 获取 MCP 服务器配置
function getMcpServer(name) {
  const config = loadConfig();
  return config.mcpServers[name];
}

// 启用/禁用 MCP 服务器
function toggleMcpServer(name, enable) {
  const config = loadConfig();

  if (!config.mcpServers[name]) {
    log(colors.red, `MCP 服务器 "${name}" 不存在`);
    return false;
  }

  config.mcpServers[name].disabled = !enable;
  saveConfig(config);

  const status = enable ? '启用' : '禁用';
  log(colors.green, `MCP 服务器 "${name}" 已${status}`);
  return true;
}

// 测试 MCP 服务器连接
async function testMcpServer(name) {
  const server = getMcpServer(name);

  if (!server) {
    log(colors.red, `MCP 服务器 "${name}" 不存在`);
    return false;
  }

  log(colors.cyan, `测试 MCP 服务器：${name}`);
  log(colors.gray, `命令：${server.command} ${server.args?.join(' ') || ''}`);

  return new Promise((resolve) => {
    const child = exec(server.command, {
      timeout: 10000,
      env: { ...process.env, ...server.env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => { stdout += data; });
    child.stderr?.on('data', (data) => { stderr += data; });

    child.on('close', (code) => {
      if (code === 0 || stdout.length > 0) {
        log(colors.green, `连接成功`);
        resolve(true);
      } else {
        log(colors.red, `连接失败：${stderr || '退出码 ' + code}`);
        resolve(false);
      }
    });

    child.on('error', (err) => {
      log(colors.red, `执行错误：${err.message}`);
      resolve(false);
    });
  });
}

// 导出函数
module.exports = {
  loadConfig,
  saveConfig,
  addMcpServer,
  removeMcpServer,
  listMcpServers,
  getMcpServer,
  toggleMcpServer,
  testMcpServer,
  MCP_CONFIG_PATH,
};

// CLI 模式
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  async function run() {
    switch (command) {
      case 'list':
        listMcpServers();
        break;

      case 'add':
        if (args.length < 3) {
          log(colors.red, '用法：mcp-manager.js add <name> <command>');
          process.exit(1);
        }
        await addMcpServer(args[1], { command: args[2], args: args.slice(3) });
        break;

      case 'remove':
      case 'rm':
        if (args.length < 2) {
          log(colors.red, '用法：mcp-manager.js remove <name>');
          process.exit(1);
        }
        removeMcpServer(args[1]);
        break;

      case 'enable':
        if (args.length < 2) {
          log(colors.red, '用法：mcp-manager.js enable <name>');
          process.exit(1);
        }
        toggleMcpServer(args[1], true);
        break;

      case 'disable':
        if (args.length < 2) {
          log(colors.red, '用法：mcp-manager.js disable <name>');
          process.exit(1);
        }
        toggleMcpServer(args[1], false);
        break;

      case 'test':
        if (args.length < 2) {
          log(colors.red, '用法：mcp-manager.js test <name>');
          process.exit(1);
        }
        await testMcpServer(args[1]);
        break;

      default:
        log(colors.cyan, 'MCP 管理器 - 使用方法:');
        log(colors.gray, '  node mcp-manager.js list          - 列出所有服务器');
        log(colors.gray, '  node mcp-manager.js add <name> <command> - 添加服务器');
        log(colors.gray, '  node mcp-manager.js remove <name> - 删除服务器');
        log(colors.gray, '  node mcp-manager.js enable <name> - 启用服务器');
        log(colors.gray, '  node mcp-manager.js disable <name>- 禁用服务器');
        log(colors.gray, '  node mcp-manager.js test <name>   - 测试连接');
    }
  }

  run().catch(console.error);
}
