/**
 * 圖片轉檔／壓縮的純邏輯部分。不要匯入 Vue 或碰 DOM。
 *
 * 實際的縮圖與編碼是靠 Canvas 做的，那段沒辦法在 Node 測試環境跑，
 * 所以留在 index.vue；這裡只放算得出對錯、值得測的部分。
 */

export const FORMATS = [
  { value: 'image/webp', label: 'WebP', ext: 'webp', lossy: true },
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg', lossy: true },
  { value: 'image/png', label: 'PNG', ext: 'png', lossy: false },
]

export function findFormat(mime) {
  return FORMATS.find((f) => f.value === mime) || null
}

/** 把位元組數變成人看得懂的字串 */
export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

/**
 * 算出等比例縮放後的尺寸。maxWidth / maxHeight 只當上限用，
 * 圖片比上限小就原樣不動（不要把小圖硬放大，那只會變模糊又變大）。
 */
export function calculateDimensions(width, height, maxWidth, maxHeight) {
  const w = Number(width)
  const h = Number(height)
  if (!(w > 0) || !(h > 0)) {
    return { ok: false, error: '圖片尺寸讀不出來' }
  }

  const limitW = Number(maxWidth) > 0 ? Number(maxWidth) : Infinity
  const limitH = Number(maxHeight) > 0 ? Number(maxHeight) : Infinity

  const ratio = Math.min(limitW / w, limitH / h, 1)
  return {
    ok: true,
    value: {
      width: Math.max(1, Math.round(w * ratio)),
      height: Math.max(1, Math.round(h * ratio)),
      scaled: ratio < 1,
    },
  }
}

/** 品質值限制在 0.1~1 之間，PNG 是無損格式所以直接忽略 */
export function clampQuality(quality, mime) {
  const format = findFormat(mime)
  if (format && !format.lossy) return undefined
  const q = Number(quality)
  if (!Number.isFinite(q)) return 0.8
  return Math.min(1, Math.max(0.1, q))
}

/** 換副檔名，保留原本的檔名 */
export function outputFilename(originalName, mime) {
  const format = findFormat(mime)
  const ext = format ? format.ext : 'bin'
  const base = String(originalName || 'image').replace(/\.[^.]+$/, '')
  return `${base || 'image'}.${ext}`
}

/** 算出壓縮後省了多少，負數代表反而變大了 */
export function savingPercent(originalBytes, newBytes) {
  const from = Number(originalBytes)
  const to = Number(newBytes)
  if (!(from > 0) || !Number.isFinite(to)) return null
  return Math.round(((from - to) / from) * 100)
}
