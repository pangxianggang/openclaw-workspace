const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 🔴 火星文件 - 智能代码修复模块
 * 
 * 功能：
 * 1. 读取文件内容（带行号）
 * 2. 分析问题
 * 3. 生成精确修复方案
 * 4. 应用修复（事务式）
 */

class CodeFixer {
  constructor(config) {
    this.config = config;
    this.fmCliPath = config.fmCliPath;
  }

  /**
   * 读取文件内容（带行号）
   */
  async readFileWithLines(filePath, startLine = 0, endLine = 200) {
    return new Promise((resolve, reject) => {
      const command = `"${this.fmCliPath}" read "${filePath}" --start ${startLine} --end ${endLine}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`读取文件失败：${stderr}`));
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          resolve({
            content: result.content,
            startLine: result.startLine || startLine,
            endLine: result.endLine || endLine,
            totalLines: result.totalLines || 0,
            baseVersion: result.baseVersion
          });
        } catch (e) {
          resolve({
            content: stdout,
            startLine,
            endLine,
            baseVersion: null
          });
        }
      });
    });
  }

  /**
   * 分析代码问题
   */
  async analyzeCode(filePath, problem, aiClient) {
    const fileData = await this.readFileWithLines(filePath);
    
    const prompt = `
你是一个专业的代码审查专家。请分析以下代码中的问题：

**文件路径**: ${filePath}
**用户描述的问题**: ${problem}

**代码内容** (行 ${fileData.startLine}-${fileData.endLine}):
\`\`\`
${fileData.content}
\`\`\`

请分析：
1. 代码中存在什么问题？
2. 问题的根本原因是什么？
3. 如何修复这个问题？
4. 需要修改哪些行？

请给出详细的分析报告。
`;

    const analysis = await aiClient.chat(prompt);
    return {
      analysis,
      fileData
    };
  }

  /**
   * 生成修复方案
   */
  async generateFix(filePath, problem, analysis, aiClient) {
    const fileData = await this.readFileWithLines(filePath);
    
    const prompt = `
你是一个专业的代码修复专家。请根据以下分析生成精确的修复方案：

**文件路径**: ${filePath}
**问题描述**: ${problem}

**分析报告**:
${analysis}

**当前代码** (行 ${fileData.startLine}-${fileData.endLine}):
\`\`\`
${fileData.content}
\`\`\`

请生成修复方案，使用以下格式：

## 修复方案

### 修改位置
- 起始行：X
- 结束行：Y

### 原始代码
\`\`\`javascript
// 原始代码
\`\`\`

### 修复后代码
\`\`\`javascript
// 修复后的代码
\`\`\`

### 修改说明
解释为什么要这样修改

### JSON 格式编辑操作
请同时提供 JSON 格式的编辑操作，用于自动应用：
\`\`\`json
[
  {
    "id": "fix1",
    "type": "replace_range",
    "target": {
      "type": "range",
      "startLine": X,
      "endLine": Y
    },
    "newText": "新的代码内容"
  }
]
\`\`\`
`;

    const fixPlan = await aiClient.chat(prompt);
    return fixPlan;
  }

  /**
   * 应用修复（事务式）
   */
  async applyFix(filePath, editOps, baseVersion) {
    return new Promise((resolve, reject) => {
      const opsJson = JSON.stringify(editOps);
      const command = `"${this.fmCliPath}" apply "${filePath}" --ops '${opsJson}' --base-version "${baseVersion}" --dry-run`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`应用修复失败：${stderr}`));
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          resolve({
            success: true,
            transactionId: result.transactionId,
            preview: result.preview,
            message: '✅ 修复预览成功，请确认后提交'
          });
        } catch (e) {
          resolve({
            success: true,
            preview: stdout,
            message: '✅ 修复预览成功'
          });
        }
      });
    });
  }

  /**
   * 提交修复
   */
  async commitFix(transactionId) {
    return new Promise((resolve, reject) => {
      const command = `"${this.fmCliPath}" commit ${transactionId}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`提交修复失败：${stderr}`));
          return;
        }
        
        resolve({
          success: true,
          message: '✅ 修复已提交'
        });
      });
    });
  }

  /**
   * 完整修复流程
   */
  async fixCode(filePath, problem, aiClient, autoCommit = false) {
    console.log(`\n🔍 分析文件：${filePath}`);
    console.log(`📝 问题描述：${problem}`);
    
    // 1. 分析问题
    console.log('\n📊 步骤 1: 分析问题...');
    const { analysis, fileData } = await this.analyzeCode(filePath, problem, aiClient);
    console.log(analysis);
    
    // 2. 生成修复方案
    console.log('\n🔧 步骤 2: 生成修复方案...');
    const fixPlan = await this.generateFix(filePath, problem, analysis, aiClient);
    console.log(fixPlan);
    
    // 3. 提取 JSON 编辑操作
    const jsonMatch = fixPlan.match(/```json([\s\S]*?)```/);
    if (!jsonMatch) {
      return {
        success: false,
        message: '❌ 无法解析修复方案，请手动应用'
      };
    }
    
    const editOps = JSON.parse(jsonMatch[1]);
    
    // 4. 应用修复
    console.log('\n💾 步骤 3: 应用修复...');
    const applyResult = await this.applyFix(filePath, editOps, fileData.baseVersion);
    console.log(applyResult.message);
    
    // 5. 自动提交（如果启用）
    if (autoCommit && applyResult.transactionId) {
      console.log('\n✅ 步骤 4: 提交修复...');
      const commitResult = await this.commitFix(applyResult.transactionId);
      console.log(commitResult.message);
      return commitResult;
    }
    
    return applyResult;
  }
}

module.exports = CodeFixer;
