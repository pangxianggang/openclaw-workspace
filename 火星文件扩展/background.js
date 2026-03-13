/**
 * 后台脚本 - 通过 HTTP 调用火星文件管理
 */

const FM_SERVICE_URL = 'http://127.0.0.1:8765/rpc';

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FM_REQUEST') {
    callFMService(message.data)
      .then(result => {
        // 转发响应给当前标签页
        if (sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'FM_RESPONSE',
            data: { success: true, data: result }
          });
        }
        sendResponse({ status: 'ok' });
      })
      .catch(error => {
        console.error('[FM Bridge] 调用失败:', error);
        if (sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'FM_ERROR',
            error: error.message
          });
        }
        sendResponse({ status: 'error', message: error.message });
      });

    return true; // 保持消息通道开放
  }
  return true;
});

// 调用火星文件管理 HTTP 服务
async function callFMService(data) {
  try {
    const response = await fetch(FM_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      // 禁用 CORS 检查（扩展不受限）
      mode: 'cors'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (e) {
    // 如果服务未启动，提供友好提示
    if (e.message.includes('Failed to fetch') || e.message.includes('ECONNREFUSED')) {
      throw new Error('火星文件服务未启动，请先运行"启动火星文件服务.bat"');
    }
    throw e;
  }
}

console.log('[FM Bridge] 后台服务已启动');
