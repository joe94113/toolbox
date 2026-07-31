export function encodeUrl(text) {
  if (!text) return { ok: true, value: '' }
  try {
    return { ok: true, value: encodeURIComponent(text) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function decodeUrl(text) {
  if (!text.trim()) return { ok: true, value: '' }
  try {
    return { ok: true, value: decodeURIComponent(text) }
  } catch {
    return { ok: false, error: '這段內容不是合法的 URL 編碼格式，檢查看看有沒有貼錯' }
  }
}
