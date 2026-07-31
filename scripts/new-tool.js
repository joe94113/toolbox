#!/usr/bin/env node
// 用法：node scripts/new-tool.js <id> "<顯示名稱>" "<描述>"
// 例如：node scripts/new-tool.js uuid-generator "UUID 產生器" "產生一組 v4 UUID"
//
// 會建立四個檔案：
//   meta.js        名稱、描述、分類與圖示（顯示在首頁卡片上）
//                  圖示先給一個佔位圓圈，記得換成這個工具自己的 SVG path
//   logic.js        純運算邏輯，不碰 Vue／DOM，方便測試
//   logic.test.js    邏輯的測試（先把這個補完、跑綠燈，再動畫面）
//   index.vue        畫面，套用共用的 ToolShell + CopyButton
//
// 路由是自動掃描 src/tools/* 產生的，新增資料夾後不用改任何其他檔案。

import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const [, , id, name, description, category] = process.argv

if (!id || !name) {
  console.error('用法: node scripts/new-tool.js <id> "<名稱>" "<描述>" "<分類>"')
  console.error('分類可選：編碼與雜湊 / 文字處理 / 資料格式 / 開發輔助 / 時間與排程 / 換算與計算')
  console.error('沒填的話會歸到「其他」，之後補進 meta.js 就好')
  process.exit(1)
}

const toolDir = join(__dirname, '..', 'src', 'tools', id)
if (existsSync(toolDir)) {
  console.error(`工具 "${id}" 已經存在: ${toolDir}`)
  process.exit(1)
}

mkdirSync(toolDir, { recursive: true })

writeFileSync(
  join(toolDir, 'meta.js'),
  `export default {\n  name: '${name}',\n  description: '${description || ''}',\n  category: '${category || '其他'}',\n  icon: '<circle cx="12" cy="12" r="7"/>',\n}\n`
)

writeFileSync(
  join(toolDir, 'logic.js'),
  `/**\n * ${name} 的核心邏輯。不要匯入 Vue 或碰 DOM，\n * 這樣才能直接用 vitest 測試。\n * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。\n */\nexport function run(input) {\n  if (!input) {\n    return { ok: true, value: '' }\n  }\n  // TODO: 換成真正的邏輯\n  return { ok: true, value: input }\n}\n`
)

writeFileSync(
  join(toolDir, 'logic.test.js'),
  `import { describe, it, expect } from 'vitest'\nimport { run } from './logic.js'\n\ndescribe('${name}', () => {\n  it('空輸入回傳空結果', () => {\n    expect(run('')).toEqual({ ok: true, value: '' })\n  })\n\n  // TODO: 補上這個工具實際的行為測試\n})\n`
)

writeFileSync(
  join(toolDir, 'index.vue'),
  `<script setup>\nimport { ref, computed } from 'vue'\nimport ToolShell from '../../components/ToolShell.vue'\nimport CopyButton from '../../components/CopyButton.vue'\nimport { run } from './logic.js'\n\nconst input = ref('')\nconst result = computed(() => run(input.value))\n</script>\n\n<template>\n  <ToolShell title="${name}">\n    <p class="hint">${description || '貼上內容，馬上拿到結果。'}</p>\n\n    <textarea v-model="input" rows="6" class="area" placeholder="在這裡貼上內容…"></textarea>\n\n    <template v-if="!result.ok">\n      <p class="error">{{ result.error }}</p>\n    </template>\n    <template v-else-if="result.value">\n      <div class="output-head">\n        <span class="output-label">結果</span>\n        <CopyButton :text="result.value" />\n      </div>\n      <pre class="output">{{ result.value }}</pre>\n    </template>\n    <p v-else class="empty">貼上內容後，結果會顯示在這裡。</p>\n  </ToolShell>\n</template>\n\n<style scoped>\n.hint {\n  margin: 0 0 1rem;\n  color: var(--ink-soft);\n  font-size: 0.9rem;\n}\n.area {\n  width: 100%;\n  box-sizing: border-box;\n  font-family: var(--font-mono);\n  font-size: 0.88rem;\n  padding: 0.9rem;\n  border: 1px solid var(--line);\n  border-radius: 6px;\n  background: var(--pegboard);\n  resize: vertical;\n  margin-bottom: 1rem;\n}\n.output-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 0.5rem;\n}\n.output-label {\n  font-family: var(--font-display);\n  font-size: 0.8rem;\n  letter-spacing: 0.06em;\n  text-transform: uppercase;\n  color: var(--ink-soft);\n}\n.output {\n  margin: 0;\n  white-space: pre-wrap;\n  word-break: break-all;\n  font-family: var(--font-mono);\n  font-size: 0.85rem;\n  padding: 0.9rem;\n  border: 1px solid var(--line);\n  border-radius: 6px;\n  background: var(--pegboard);\n}\n.error {\n  margin: 0;\n  color: var(--danger);\n  font-weight: 500;\n}\n.empty {\n  color: var(--ink-soft);\n  font-size: 0.88rem;\n  font-style: italic;\n  margin: 0;\n}\n</style>\n`
)

console.log(`已建立新工具：src/tools/${id}/`)
console.log('先把 logic.test.js 寫完、npm test 跑綠燈，再調整 index.vue 的畫面')
