/**
 * JWT 產生器的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 簽章用瀏覽器內建的 Web Crypto（Node 18+ 也有，所以測試跑得動）。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 這是拿來做測試用 token 的，不要把正式環境的密鑰貼進來——
 * 雖然運算都在本機，但密鑰留在瀏覽器分頁裡本身就不是好習慣。
 */

export const ALGORITHMS = [
  { value: 'HS256', hash: 'SHA-256', label: 'HS256' },
  { value: 'HS384', hash: 'SHA-384', label: 'HS384' },
  { value: 'HS512', hash: 'SHA-512', label: 'HS512' },
]

/** base64url：把 +/ 換成 -_ 並去掉結尾的 = */
export function base64UrlEncode(bytes) {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function encodeJsonSegment(obj) {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(obj)))
}

export function base64UrlDecode(text) {
  const padded = String(text).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/** 產生常用的時間欄位，省得自己算時間戳 */
export function buildClaims({ subject = '', issuer = '', audience = '', expiresInSeconds = 3600 }) {
  const now = Math.floor(Date.now() / 1000)
  const claims = { iat: now }
  if (subject) claims.sub = subject
  if (issuer) claims.iss = issuer
  if (audience) claims.aud = audience
  if (Number(expiresInSeconds) > 0) claims.exp = now + Number(expiresInSeconds)
  return claims
}

export async function sign(payloadText, secret, algorithm = 'HS256') {
  const algo = ALGORITHMS.find((a) => a.value === algorithm)
  if (!algo) return { ok: false, error: '不支援這個演算法' }
  if (!secret) return { ok: false, error: '請填簽章用的密鑰' }

  let payload
  try {
    payload = JSON.parse(String(payloadText || '{}'))
  } catch (e) {
    return { ok: false, error: `payload 不是合法的 JSON：${e.message}` }
  }
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'payload 要是一個物件' }
  }

  const header = { alg: algorithm, typ: 'JWT' }
  const signingInput = `${encodeJsonSegment(header)}.${encodeJsonSegment(payload)}`

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: algo.hash },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signingInput)
    )
    const token = `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`
    return { ok: true, value: { token, header, payload } }
  } catch (e) {
    return { ok: false, error: `簽章失敗：${e.message}` }
  }
}

/** 驗證一個 token 的簽章對不對，跟解碼不同——這個會真的比對 */
export async function verify(token, secret) {
  const parts = String(token ?? '').trim().split('.')
  if (parts.length !== 3) {
    return { ok: false, error: 'JWT 應該有三段，用點號分隔' }
  }

  let header
  try {
    header = JSON.parse(base64UrlDecode(parts[0]))
  } catch {
    return { ok: false, error: 'header 解不開' }
  }

  const algo = ALGORITHMS.find((a) => a.value === header.alg)
  if (!algo) {
    return { ok: false, error: `這個工具只驗得了 HMAC 系列，這個 token 用的是 ${header.alg}` }
  }

  const expected = await sign(base64UrlDecode(parts[1]), secret, header.alg)
  if (!expected.ok) return expected

  return { ok: true, value: { valid: expected.value.token === String(token).trim() } }
}
