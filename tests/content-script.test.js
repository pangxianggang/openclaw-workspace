const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('manifest.json structure validation', () => {
  const manifestPath = path.join(__dirname, '..', '火星文件扩展', 'manifest.json');

  it('should exist', () => {
    assert.ok(fs.existsSync(manifestPath), 'manifest.json should exist');
  });

  it('should be valid JSON', () => {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    assert.doesNotThrow(() => JSON.parse(content), 'manifest.json should be valid JSON');
  });

  it('should use manifest_version 3', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.strictEqual(manifest.manifest_version, 3);
  });

  it('should have a name', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.ok(manifest.name, 'manifest should have a name');
    assert.strictEqual(typeof manifest.name, 'string');
  });

  it('should have a version', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.ok(manifest.version, 'manifest should have a version');
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  });

  it('should have content_scripts defined', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.ok(Array.isArray(manifest.content_scripts), 'content_scripts should be an array');
    assert.ok(manifest.content_scripts.length > 0, 'content_scripts should not be empty');
  });

  it('should have a background service_worker', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.ok(manifest.background, 'background should be defined');
    assert.ok(manifest.background.service_worker, 'service_worker should be defined');
  });

  it('should have required permissions', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.ok(Array.isArray(manifest.permissions), 'permissions should be an array');
  });

  it('should reference existing JS files in content_scripts', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const extensionDir = path.dirname(manifestPath);
    for (const script of manifest.content_scripts) {
      for (const jsFile of script.js) {
        const filePath = path.join(extensionDir, jsFile);
        assert.ok(fs.existsSync(filePath), `Referenced file ${jsFile} should exist`);
      }
    }
  });

  it('should reference an existing background service_worker file', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const extensionDir = path.dirname(manifestPath);
    const swPath = path.join(extensionDir, manifest.background.service_worker);
    assert.ok(fs.existsSync(swPath), `Service worker ${manifest.background.service_worker} should exist`);
  });
});
