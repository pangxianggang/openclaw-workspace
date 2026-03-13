// =========================================
// 火星文件管理 - 浏览器控制台测试脚本
// 在 CodeGPS-Pro.html 页面按 F12 打开控制台，粘贴运行
// =========================================

console.log('🔴 火星文件管理测试');
console.log('====================');

// 测试 1: 检查 fmApi 是否可用
console.log('\n1️⃣ 检查 fmApi...');
if (typeof window.fmApi !== 'undefined') {
    console.log('✅ fmApi 已加载');
    console.log('   可用方法:', Object.keys(window.fmApi).join(', '));
} else {
    console.log('❌ fmApi 未加载，请检查脚本是否注入');
}

// 测试 2: 检查服务连接
console.log('\n2️⃣ 检查服务连接...');
fetch('http://127.0.0.1:8765/rpc', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({method:'tree', params:{path:'.', depth:0}})
}).then(res => res.json()).then(data => {
    if (data.success) {
        console.log('✅ 火星文件服务已连接 (端口 8765)');
    } else {
        console.log('❌ 服务响应异常:', data);
    }
}).catch(err => {
    console.log('❌ 服务未响应，请确保"启动火星文件服务.bat"正在运行');
    console.log('   错误:', err.message);
});

// 测试 3: 测试 tree 命令
console.log('\n3️⃣ 测试 tree 命令...');
window.fmApi.tree('.', 1).then(result => {
    console.log('✅ tree 成功:');
    console.log('   目录:', result.name);
    console.log('   子项数量:', result.children?.length || 0);
}).catch(err => {
    console.log('❌ tree 失败:', err.message);
});

// 测试 4: 测试 read 命令
console.log('\n4️⃣ 测试 read 命令...');
window.fmApi.readRange('README.md', 0, 10, 0).then(result => {
    console.log('✅ read 成功:');
    console.log('   文件:', result.path);
    console.log('   版本:', result.version?.substring(0, 20) + '...');
    console.log('   总行数:', result.totalLines);
    console.log('   前 3 行:', result.lines?.slice(0,3).map(l=>l.content).join(' | '));
}).catch(err => {
    console.log('❌ read 失败:', err.message);
});

// 测试 5: 测试 search 命令
console.log('\n5️⃣ 测试 search 命令...');
window.fmApi.search('function', {include:'**/*.js', maxResults:3}).then(result => {
    console.log('✅ search 成功:');
    console.log('   匹配总数:', result.totalMatches);
    console.log('   文件数量:', result.files);
    result.matches?.slice(0,2).forEach(m => {
        console.log(`   - ${m.path}:${m.lineNumber} ${m.matchedText}`);
    });
}).catch(err => {
    console.log('❌ search 失败:', err.message);
});

// 测试 6: 检查 AI 集成
console.log('\n6️⃣ 检查 AI 集成...');
if (typeof window.SmartCodeEngine !== 'undefined') {
    console.log('✅ SmartCodeEngine 存在');
    console.log('   FM_TOOLS 已注入:', typeof window.FM_TOOLS !== 'undefined');
} else {
    console.log('⚠️ SmartCodeEngine 未找到 (这是正常的，如果页面没有 AI 功能)');
}

console.log('\n====================');
console.log('测试完成！查看上方结果');
