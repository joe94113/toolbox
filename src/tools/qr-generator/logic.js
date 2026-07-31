/**
 * QR Code 產生器的純邏輯部分。不要匯入 Vue 或碰 DOM。
 * 實際畫圖交給 qrcode 套件在 index.vue 處理，這裡負責驗證與組字串。
 */

// 各容錯等級在 byte 模式下的理論上限（版本 40）。
// 超過就一定編不出來，先擋掉比丟出套件的原始錯誤好懂。
const MAX_BYTES = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
}

export const ERROR_LEVELS = [
  { value: 'L', label: '低（容錯 7%）' },
  { value: 'M', label: '中（容錯 15%）' },
  { value: 'Q', label: '較高（容錯 25%）' },
  { value: 'H', label: '高（容錯 30%）' },
]

/** QR 是以位元組計算容量的，中文一個字通常吃 3 bytes，不能用字數判斷 */
export function byteLength(text) {
  return new TextEncoder().encode(String(text ?? '')).length
}

export function validateContent(text, errorLevel = 'M') {
  const raw = String(text ?? '')
  if (!raw) return { ok: true, value: null }

  const limit = MAX_BYTES[errorLevel] ?? MAX_BYTES.M
  const size = byteLength(raw)

  if (size > limit) {
    return {
      ok: false,
      error: `內容太長了（${size} 位元組，這個容錯等級最多 ${limit}）。可以改用低一點的容錯等級，或縮短內容。`,
    }
  }

  return { ok: true, value: { text: raw, bytes: size, limit } }
}

/** 幾種常見用途的內容格式，照著填就不會寫錯 */
export function buildWifiPayload({ ssid, password = '', encryption = 'WPA', hidden = false }) {
  if (!ssid) return { ok: false, error: '請填 Wi-Fi 名稱（SSID）' }
  // 這幾個字元在 Wi-Fi QR 格式裡有特殊意義，要跳脫
  const escape = (s) => String(s).replace(/([\\;,":])/g, '\\$1')
  const parts = [
    `T:${encryption}`,
    `S:${escape(ssid)}`,
    encryption === 'nopass' ? '' : `P:${escape(password)}`,
    hidden ? 'H:true' : '',
  ].filter(Boolean)
  return { ok: true, value: `WIFI:${parts.join(';')};;` }
}

export function buildMailtoPayload({ to, subject = '', body = '' }) {
  if (!to) return { ok: false, error: '請填收件人信箱' }
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return { ok: true, value: `mailto:${to}${query ? `?${query}` : ''}` }
}
