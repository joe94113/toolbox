/**
 * UUID 產生器的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 */

const MAX_COUNT = 100

// 亂數來源開放成參數，測試時才能塞一個固定的假產生器進來比對輸出，
// 不然每次結果都不一樣沒辦法斷言。
export function generateUuids(count = 1, options = {}) {
  const { uppercase = false, hyphens = true, makeUuid = () => crypto.randomUUID() } = options

  const n = Number(count)
  if (!Number.isInteger(n) || n < 1) {
    return { ok: false, error: '數量至少要 1 個' }
  }
  if (n > MAX_COUNT) {
    return { ok: false, error: `一次最多產生 ${MAX_COUNT} 個，太多了畫面會卡住` }
  }

  const list = Array.from({ length: n }, () => {
    let id = makeUuid()
    if (!hyphens) id = id.replace(/-/g, '')
    return uppercase ? id.toUpperCase() : id.toLowerCase()
  })

  return { ok: true, value: list }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * 檢查一段文字是不是合法的 UUID，順便讀出它的版本。
 * 貼別人給的 id 進來確認格式時很好用。
 */
export function inspectUuid(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return { ok: true, value: null }

  // 允許使用者貼上帶大括號或沒有連字號的寫法
  const cleaned = trimmed.replace(/^\{|\}$/g, '')
  const normalized =
    cleaned.length === 32 && /^[0-9a-f]{32}$/i.test(cleaned)
      ? `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`
      : cleaned

  if (!UUID_PATTERN.test(normalized)) {
    return { ok: false, error: '這不是合法的 UUID，長度或格式對不上' }
  }

  return {
    ok: true,
    value: {
      normalized: normalized.toLowerCase(),
      version: Number(normalized[14]),
    },
  }
}
