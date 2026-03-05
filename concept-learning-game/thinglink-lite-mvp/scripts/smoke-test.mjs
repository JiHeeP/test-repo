#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const reqFiles = [
  'index.html',
  'styles.css',
  'scenes.js',
  'js/main.js',
  'js/render.js',
  'js/storage.js',
  'js/utils.js',
  'js/validators.js',
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

try {
  // 1) 필수 파일 존재
  for (const f of reqFiles) {
    assert(existsSync(join(root, f)), `필수 파일 누락: ${f}`);
  }

  // 2) index.html 핵심 요소/스크립트 체크
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const requiredIds = [
    'sceneList', 'viewer360', 'flatViewer', 'modelViewerWrap',
    'tagDialog', 'sceneDialog', 'statusBar',
    'importJson', 'importJsonInput'
  ];
  for (const id of requiredIds) {
    assert(html.includes(`id="${id}"`), `index.html에 id 누락: ${id}`);
  }
  assert(html.includes('./js/main.js'), 'main module script 누락');
  assert(html.includes('dompurify'), 'DOMPurify script 누락');
  assert(html.includes('model-viewer'), 'model-viewer script 누락');

  // 3) JS 문법 체크
  const jsFiles = ['js/main.js', 'js/render.js', 'js/storage.js', 'js/utils.js', 'js/validators.js'];
  for (const f of jsFiles) {
    execSync(`node --check "${join(root, f)}"`, { stdio: 'pipe' });
  }

  // 4) scenes.js 기본 구조 체크
  const scenes = readFileSync(join(root, 'scenes.js'), 'utf8');
  assert(scenes.includes('window.SCENES'), 'scenes.js에 window.SCENES 선언 없음');

  console.log('✅ smoke test passed');
  process.exit(0);
} catch (err) {
  console.error('❌ smoke test failed');
  console.error(err.message || err);
  process.exit(1);
}
