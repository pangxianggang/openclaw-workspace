/**
 * 火星文件管理 HTTP 桥接服务
 * 通过 HTTP API 调用火星文件管理 CLI
 */

const http = require('http');
const { exec } = require('child_process');
const path = require('path');

// 配置
const PORT = process.env.FM_PORT || 8765;
const FM_CLI = path.join(__dirname, '..', '火星文件', 'dist', 'cli', 'index.js');
const WORKSPACE = process.env.FM_WORKSPACE || process.cwd();

console.log('🔴 火星文件管理 HTTP 桥接服务');
console.log(`   工作区：${WORKSPACE}`);
console.log(`   端口：${PORT}`);
console.log('');

const server = http.createServer(async (req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method Not Allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { method, params } = JSON.parse(body);
      console.log(`[${new Date().toISOString()}] ${method}`, params);

      const result = await executeFMCommand(method, params);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: result }));
    } catch (error) {
      console.error('Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
  });
});

async function executeFMCommand(method, params) {
  return new Promise((resolve, reject) => {
    const args = [FM_CLI, method];

    // 添加工作区参数
    if (params.workspace) {
      args.push('--workspace', params.workspace);
    } else {
      args.push('--workspace', WORKSPACE);
    }

    // 根据命令添加参数
    switch (method) {
      case 'tree':
        if (params.path) args.push(params.path);
        if (params.depth) args.push('--depth', params.depth);
        break;

      case 'stat':
      case 'read':
      case 'outline':
      case 'symbols':
        if (params.path) args.push(params.path);
        if (params.start !== undefined) args.push('--start', params.start);
        if (params.end !== undefined) args.push('--end', params.end);
        if (params.context !== undefined) args.push('--context', params.context);
        break;

      case 'search':
        if (params.pattern) args.push(params.pattern);
        if (params.regex) args.push('--regex');
        if (params.include) args.push('--include', params.include);
        if (params.maxResults) args.push('--max', params.maxResults);
        if (params.contextLines) args.push('--context', params.contextLines);
        break;

      case 'apply':
        if (params.path) args.push(params.path);
        if (params.ops) args.push('--ops', JSON.stringify(params.ops));
        if (params.baseVersion) args.push('--base-version', params.baseVersion);
        if (params.dryRun !== undefined) {
          args.push(params.dryRun ? '--dry-run' : '--no-dry-run');
        }
        break;

      case 'commit':
      case 'rollback':
      case 'diff':
        if (params.transactionId) args.push(params.transactionId);
        break;

      case 'create':
        if (params.path) args.push(params.path);
        if (params.content) args.push('--content', params.content);
        break;

      case 'delete':
        if (params.path) args.push(params.path);
        if (params.confirm) args.push('--confirm');
        break;

      case 'move':
        if (params.source) args.push(params.source);
        if (params.dest) args.push(params.dest);
        break;

      case 'history':
        if (params.limit) args.push('--limit', params.limit);
        break;

      default:
        reject(new Error(`未知命令：${method}`));
        return;
    }

    const command = `node ${args.join(' ')}`;
    console.log('  执行:', command);

    exec(command, {
      cwd: WORKSPACE,
      maxBuffer: 10 * 1024 * 1024, // 10MB
      encoding: 'utf8'
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      try {
        // 尝试解析 JSON 输出
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (e) {
        // 如果不是 JSON，返回原始输出
        resolve({ raw: stdout });
      }
    });
  });
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ 服务已启动：http://127.0.0.1:${PORT}/rpc`);
  console.log('');
  console.log('可用命令:');
  console.log('  tree, stat, read, search, outline, symbols');
  console.log('  apply, commit, rollback, create, delete, move');
  console.log('  diff, history');
  console.log('');
  console.log('按 Ctrl+C 停止服务');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在停止服务...');
  server.close(() => {
    console.log('服务已停止');
    process.exit(0);
  });
});
