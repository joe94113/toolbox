/**
 * 圖片轉 Base64 data URI 的純邏輯部分。不要匯入 Vue 或碰 DOM。
 * 讀檔案是 FileReader 的事，那段留在 index.vue。
 */

/** Base64 編碼後大約會變大三分之一，先讓使用者有心理準備 */
export function estimateEncodedSize(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.ceil(n / 3) * 4
}

export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export function buildDataUri(mime, base64) {
  const type = String(mime || 'application/octet-stream')
  return `data:${type};base64,${String(base64 || '')}`
}

/** 反過來：把貼進來的 data URI 拆開，看看是什麼型別、多大 */
export function parseDataUri(uri) {
  const text = String(uri ?? '').trim()
  if (!text) return { ok: true, value: null }

  const match = text.match(/^data:([^;,]*)(;base64)?,(.*)$/s)
  if (!match) {
    return { ok: false, error: '這不是合法的 data URI，開頭要像 data:image/png;base64,' }
  }

  const [, mime, isBase64, payload] = match
  if (!isBase64) {
    return { ok: false, error: '目前只看得懂 base64 編碼的 data URI' }
  }

  // 每 4 個 base64 字元還原成 3 個位元組，結尾的 = 要扣掉
  const clean = payload.replace(/\s/g, '')
  const padding = (clean.match(/=+$/) || [''])[0].length
  const bytes = Math.max(0, (clean.length / 4) * 3 - padding)

  return {
    ok: true,
    value: {
      mime: mime || 'application/octet-stream',
      base64: clean,
      approxBytes: Math.round(bytes),
    },
  }
}

/** 產生三種常見的貼上用法 */
export function buildSnippets(dataUri, altText = '') {
  const uri = String(dataUri || '')
  return {
    html: `<img src="${uri}" alt="${altText}" />`,
    css: `background-image: url("${uri}");`,
    markdown: `![${altText}](${uri})`,
  }
}
