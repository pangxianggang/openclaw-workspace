/**
 * 火星文件管理集成模块
 * 为 CodeGPS Pro 添加火星文件管理能力
 */

(function() {
    console.log('[FM Integration] 火星文件管理集成已加载');

    // 火星文件管理工具定义
    window.FM_TOOLS = {
        fm_tree: {
            name: 'fm_tree',
            description: '查看目录树结构，支持深度和 glob 匹配',
            parameters: {
                path: { type: 'string', description: '目录路径', default: '.' },
                depth: { type: 'number', description: '遍历深度', default: 3 },
                glob: { type: 'string', description: 'Glob 模式，如 "**/*.ts"', optional: true }
            }
        },
        fm_stat: {
            name: 'fm_stat',
            description: '获取文件元数据：大小、hash、语言、行数',
            parameters: {
                path: { type: 'string', description: '文件路径' }
            }
        },
        fm_read_range: {
            name: 'fm_read_range',
            description: '局部读取文件指定行范围（带上下文窗口）',
            parameters: {
                path: { type: 'string', description: '文件路径' },
                startLine: { type: 'number', description: '起始行号', default: 0 },
                endLine: { type: 'number', description: '结束行号', default: 100 },
                context: { type: 'number', description: '上下文行数', default: 3 }
            }
        },
        fm_search: {
            name: 'fm_search',
            description: '跨文件搜索关键字或正则表达式',
            parameters: {
                pattern: { type: 'string', description: '搜索模式' },
                regex: { type: 'boolean', description: '是否正则表达式', default: false },
                caseSensitive: { type: 'boolean', description: '区分大小写', default: false },
                include: { type: 'string', description: 'Glob 包含模式', optional: true }
            }
        },
        fm_outline: {
            name: 'fm_outline',
            description: '获取 Markdown 文档大纲（标题树）',
            parameters: {
                path: { type: 'string', description: 'Markdown 文件路径' }
            }
        },
        fm_symbols: {
            name: 'fm_symbols',
            description: '获取代码 Symbol 列表（函数/类/方法边界）',
            parameters: {
                path: { type: 'string', description: '代码文件路径' }
            }
        },
        fm_apply_ops: {
            name: 'fm_apply_ops',
            description: '应用精确编辑操作（支持 dry-run 预览）',
            parameters: {
                path: { type: 'string', description: '文件路径' },
                baseVersion: { type: 'string', description: '基础版本 hash' },
                ops: { type: 'array', description: '操作列表' },
                dryRun: { type: 'boolean', description: '是否仅预览', default: true }
            }
        },
        fm_commit: {
            name: 'fm_commit',
            description: '提交暂存的事务',
            parameters: {
                transactionId: { type: 'string', description: '事务 ID' }
            }
        },
        fm_rollback: {
            name: 'fm_rollback',
            description: '回滚已提交的事务',
            parameters: {
                transactionId: { type: 'string', description: '事务 ID' }
            }
        }
    };

    // 火星文件管理 API 调用
    window.fmApi = {
        async request(method, params) {
            return new Promise((resolve, reject) => {
                const requestId = 'fm_req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                const timeout = setTimeout(() => {
                    reject(new Error('火星文件管理请求超时'));
                }, 60000);

                const messageHandler = (event) => {
                    if (event.source !== window) return;
                    if (event.data.type !== 'FM_PAGE_RESPONSE' || event.data.requestId !== requestId) return;

                    clearTimeout(timeout);
                    window.removeEventListener('message', messageHandler);

                    if (event.data.data && event.data.data.success) {
                        resolve(event.data.data.data);
                    } else {
                        reject(new Error(event.data.data?.error || '请求失败'));
                    }
                };

                window.addEventListener('message', messageHandler);

                window.postMessage({
                    type: 'FM_PAGE_REQUEST',
                    requestId,
                    payload: { method, params }
                }, '*');
            });
        },

        async tree(path = '.', depth = 3) {
            return this.request('tree', { path, depth });
        },

        async stat(path) {
            return this.request('stat', { path });
        },

        async readRange(path, startLine = 0, endLine = 10000, context = 0) {
            return this.request('readRange', { path, startLine, endLine, context });
        },

        async search(pattern, options = {}) {
            return this.request('search', { pattern, ...options });
        },

        async outline(path) {
            return this.request('outline', { path });
        },

        async symbols(path) {
            return this.request('symbols', { path });
        },

        async applyOps(path, baseVersion, ops, dryRun = true) {
            return this.request('applyOps', { path, baseVersion, ops, dryRun });
        },

        async commit(transactionId) {
            return this.request('commit', { transactionId });
        },

        async rollback(transactionId) {
            return this.request('rollback', { transactionId });
        }
    };

    // 扩展 SmartCodeEngine 添加火星文件管理工具调用
    window.addFMToolsToAI = function() {
        const fmToolsPrompt = `

🔴 **火星文件管理系统集成**（重要工具）：

你正在使用集成了火星文件管理系统的 CodeGPS Pro 平台。火星文件管理是一个"外科手术式文件编辑系统"，让你能够精确读写和修改本地文件。

**可用工具列表**：

1. **fm_tree** - 查看目录树
   - 参数：path (目录路径), depth (深度)
   - 示例：查看项目结构

2. **fm_stat** - 获取文件信息
   - 参数：path (文件路径)
   - 返回：文件大小、hash、语言、行数

3. **fm_read_range** - 读取文件指定范围
   - 参数：path, startLine, endLine, context
   - 用于：精确读取大文件的特定部分

4. **fm_search** - 跨文件搜索
   - 参数：pattern, regex, include
   - 用于：查找特定代码或关键字

5. **fm_symbols** - 获取代码符号
   - 参数：path
   - 返回：函数、类、方法列表

6. **fm_outline** - 获取 Markdown 大纲
   - 参数：path
   - 返回：标题层级结构

7. **fm_apply_ops** - 应用编辑操作
   - 参数：path, baseVersion, ops, dryRun
   - 用于：精确修改文件（支持预览）

8. **fm_commit** - 提交修改
   - 参数：transactionId

9. **fm_rollback** - 回滚修改
   - 参数：transactionId

**编辑操作流程**（必须遵守）：

1. **先读取** - 使用 fm_read_range 或 fm_symbols 了解代码结构
2. **规划修改** - 确定要修改的行号或锚点
3. **dry-run 预览** - 调用 fm_apply_ops(dryRun=true) 查看 diff
4. **用户确认** - 向用户展示修改内容，等待确认
5. **提交** - 用户确认后调用 fm_commit
6. **回滚**（如需）- 出问题时调用 fm_rollback

**操作类型**（精确编辑）：

- replace_range: 替换指定行范围
- replace_anchor: 基于锚点替换（前后标记之间）
- insert_before/insert_after: 在目标前后插入
- delete_range: 删除指定区域
- append_eof: 文件末尾追加
- replace_symbol: 替换代码符号体

**示例 - 修改代码**：

\`\`\`json
{
  "method": "fm_apply_ops",
  "params": {
    "path": "src/index.ts",
    "baseVersion": "sha256:abc123...",
    "ops": [{
      "id": "op1",
      "type": "replace_range",
      "target": {
        "type": "range",
        "startLine": 10,
        "endLine": 15,
        "expectedOldText": "旧代码"
      },
      "newText": "新代码"
    }],
    "dryRun": true
  }
}
\`\`\`

**重要原则**：
- 永远先读取再修改
- 永远使用 dryRun 预览
- 永远等待用户确认后再提交
- 使用锚点定位而非仅用行号（防止漂移）
`;

        // 更新 system prompt
        if (window.SmartCodeEngine) {
            const originalGeneratePrompt = window.SmartCodeEngine.prototype.generatePrompt;
            window.SmartCodeEngine.prototype.generatePrompt = function(userMessage, history, contextInfo) {
                const messages = originalGeneratePrompt.call(this, userMessage, history, contextInfo);

                // 在 system message 中添加火星文件管理工具说明
                const systemMessage = messages.find(m => m.role === 'system');
                if (systemMessage) {
                    systemMessage.content += fmToolsPrompt;
                }

                return messages;
            };

            console.log('[FM Integration] 已添加火星文件管理工具到 AI');
        }
    };

    // 自动执行
    window.addFMToolsToAI();

    // 添加 UI 按钮到 CodeGPS Pro 工具箱
    window.addFMToolsUI = function() {
        const toolbox = document.querySelector('.ai-toolkit');
        if (!toolbox) {
            console.warn('[FM Integration] 未找到工具箱，稍后重试...');
            setTimeout(window.addFMToolsUI, 1000);
            return;
        }

        // 检查是否已添加
        if (document.getElementById('fm-tools-btn')) return;

        const fmBtn = document.createElement('button');
        fmBtn.id = 'fm-tools-btn';
        fmBtn.className = 'btn btn-icon';
        fmBtn.innerHTML = '🔴';
        fmBtn.title = '火星文件管理';
        fmBtn.onclick = () => {
            alert('火星文件管理已集成！\n\nAI 现在可以使用 fm_tree, fm_read_range, fm_apply_ops 等工具直接读写你的本地文件。');
        };

        toolbox.appendChild(fmBtn);
        console.log('[FM Integration] 已添加 UI 按钮');
    };

    // 页面加载后添加 UI
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.addFMToolsUI);
    } else {
        window.addFMToolsUI();
    }
})();
