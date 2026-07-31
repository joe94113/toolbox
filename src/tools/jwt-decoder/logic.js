function base64UrlDecode(segment) {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/**
 * 解開 JWT 的 header 跟 payload。
 * 這只是解碼（跟瀏覽器的 atob 一樣），不會驗證簽章，
 * 不代表這個 token 沒有被竄改過或還沒過期。
 */
export function decodeJwt(token) {
  const trimmed = token.trim()
  if (!trimmed) return { ok: true, value: null }

  const parts = trimmed.split('.')
  if (parts.length !== 3) {
    return { ok: false, error: '這不是合法的 JWT 格式，應該要有三段用「.」分開的內容' }
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]))
    const payload = JSON.parse(base64UrlDecode(parts[1]))
    return {
      ok: true,
      value: {
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        signaturePresent: parts[2].length > 0,
      },
    }
  } catch {
    return { ok: false, error: '解碼失敗，header 或 payload 不是合法的內容' }
  }
}
