/**
 * 注入脚本 - 直接注入到网页上下文中，提供 fmApi 对象
 */

(function() {
  // 生成唯一请求 ID
  let requestIdCounter = 0;
  const pendingRequests = new Map();

  // 发送请求给 extension
  function sendRequest(payload) {
    return new Promise((resolve, reject) => {
      const requestId = `req_${++requestIdCounter}`;

      const timeout = setTimeout(() => {
        pendingRequests.delete(requestId);
        reject(new Error('请求超时'));
      }, 30000);

      pendingRequests.set(requestId, { resolve, reject, timeout });

      window.postMessage({
        type: 'FM_PAGE_REQUEST',
        requestId,
        payload
      }, '*');
    });
  }

  // 监听响应
  window.addEventListener('message', (event) => {
    if (event.data.type === 'FM_PAGE_RESPONSE') {
      const { requestId, data } = event.data;
      const request = pendingRequests.get(requestId);
      if (request) {
        clearTimeout(request.timeout);
        request.resolve(data);
        pendingRequests.delete(requestId);
      }
    } else if (event.data.type === 'FM_PAGE_ERROR') {
      const { requestId, error } = event.data;
      const request = pendingRequests.get(requestId);
      if (request) {
        clearTimeout(request.timeout);
        request.reject(new Error(error));
        pendingRequests.delete(requestId);
      }
    }
  });

  // 暴露全局 API
  window.fmApi = {
    // 获取文件信息
    async stat(path) {
      return sendRequest({ method: 'stat', params: { path } });
    },

    // 读取文件范围
    async readRange(path, startLine, endLine, context = 3) {
      return sendRequest({
        method: 'readRange',
        params: { path, startLine, endLine, context }
      });
    },

    // 目录树
    async tree(path = '.', depth = 3) {
      return sendRequest({ method: 'tree', params: { path, depth } });
    },

    // 搜索
    async search(pattern, options = {}) {
      return sendRequest({ method: 'search', params: { pattern, ...options } });
    },

    // 应用操作
    async applyOps(path, baseVersion, ops, dryRun = true) {
      return sendRequest({
        method: 'applyOps',
        params: { path, baseVersion, ops, dryRun }
      });
    },

    // 提交
    async commit(transactionId) {
      return sendRequest({ method: 'commit', params: { transactionId } });
    },

    // 回滚
    async rollback(transactionId) {
      return sendRequest({ method: 'rollback', params: { transactionId } });
    },

    // 创建文件
    async createFile(path, content) {
      return sendRequest({ method: 'createFile', params: { path, content } });
    },

    // 获取代码大纲
    async symbols(path) {
      return sendRequest({ method: 'symbols', params: { path } });
    },

    // 获取 Markdown 大纲
    async outline(path) {
      return sendRequest({ method: 'outline', params: { path } });
    }
  };

  console.log('[FM Bridge] fmApi 已注入到页面');
})();
