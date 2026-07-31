/**
 * 把文字轉成格式化或壓縮後的 JSON。
 * 回傳 { ok: true, value } 或 { ok: false, error }，
 * 不丟例外，方便畫面端直接判斷要顯示結果還是錯誤。
 */
export function formatJson(text, spacing = 2) {
  if (!text.trim()) {
    return { ok: true, value: '' }
  }
  try {
    const parsed = JSON.parse(text)
    return { ok: true, value: JSON.stringify(parsed, null, spacing) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}
