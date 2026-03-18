const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

describe('CodeFixer', () => {
  const CodeFixer = require(path.join(__dirname, '..', '火星文件扩展', 'code-fixer.js'));

  it('should be a constructor function', () => {
    assert.strictEqual(typeof CodeFixer, 'function');
  });

  it('should instantiate with a config object', () => {
    const config = {
      fmCliPath: '/fake/path/to/cli',
    };
    const fixer = new CodeFixer(config);
    assert.ok(fixer);
    assert.strictEqual(fixer.config, config);
    assert.strictEqual(fixer.fmCliPath, config.fmCliPath);
  });

  it('should have readFileWithLines method', () => {
    const fixer = new CodeFixer({ fmCliPath: '/fake' });
    assert.strictEqual(typeof fixer.readFileWithLines, 'function');
  });

  it('should have analyzeCode method', () => {
    const fixer = new CodeFixer({ fmCliPath: '/fake' });
    assert.strictEqual(typeof fixer.analyzeCode, 'function');
  });

  it('should have generateFix method', () => {
    const fixer = new CodeFixer({ fmCliPath: '/fake' });
    assert.strictEqual(typeof fixer.generateFix, 'function');
  });

  it('should have applyFix method', () => {
    const fixer = new CodeFixer({ fmCliPath: '/fake' });
    assert.strictEqual(typeof fixer.applyFix, 'function');
  });

  it('should have fixCode method', () => {
    const fixer = new CodeFixer({ fmCliPath: '/fake' });
    assert.strictEqual(typeof fixer.fixCode, 'function');
  });
});
