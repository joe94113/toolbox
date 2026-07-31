/**
 * 文字 → Base64。中文/emoji 等非 ASCII 字元也能正確處理。
 */
export function encodeBase64(text) {
  if (!text) {
    return { ok: true, value: '' }
  }
  try {
    return { ok: true, value: btoa(unescape(encodeURIComponent(text))) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

/**
 * Base64 → 文字。輸入不是合法 Base64 時回傳好懂的錯誤訊息，
 * 不把瀏覽器原生的例外字串直接丟給使用者看。
 */
export function decodeBase64(text) {
  if (!text.trim()) {
    return { ok: true, value: '' }
  }
  try {
    return { ok: true, value: decodeURIComponent(escape(atob(text))) }
  } catch {
    return { ok: false, error: '這不是合法的 Base64 內容，檢查看看有沒有貼錯或漏字' }
  }
}
