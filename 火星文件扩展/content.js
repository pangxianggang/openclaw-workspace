/**
 * Content Script - 注入到网页中，建立通信桥梁
 */

// 发送消息给扩展后台
function sendToExtension(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// 监听来自 injected script 的消息
window.addEventListener('message', async (event) => {
  if (event.source !== window) return;
  if (event.data.type !== 'FM_PAGE_REQUEST') return;

  const requestId = event.data.requestId;

  try {
    const response = await sendToExtension({
      type: 'FM_REQUEST',
      data: event.data.payload
    });

    // 转发响应给网页
    window.postMessage({
      type: 'FM_PAGE_RESPONSE',
      requestId,
      data: response
    }, '*');
  } catch (error) {
    window.postMessage({
      type: 'FM_PAGE_ERROR',
      requestId,
      error: error.message
    }, '*');
  }
});

console.log('[FM Bridge] Content Script 已加载');

// 注入火星文件管理集成脚本到页面
function injectFMScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('fm-integration.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
  console.log('[FM Bridge] 已注入火星文件管理集成脚本');
}

// 页面加载完成后注入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFMScript);
} else {
  injectFMScript();
}
