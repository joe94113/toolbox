const ALGORITHMS = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512',
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 用瀏覽器內建的 Web Crypto API 算雜湊值，是非同步的。
 * SHA-1 已知不適合用在安全性用途，只是拿來對照舊系統的雜湊值時常用，
 * 所以還是保留，但畫面上會標註。
 */
export async function computeHash(text, algorithm = 'SHA-256') {
  if (!text) return { ok: true, value: '' }
  if (!ALGORITHMS[algorithm]) {
    return { ok: false, error: `不支援的演算法：${algorithm}` }
  }
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest(ALGORITHMS[algorithm], data)
  return { ok: true, value: toHex(digest) }
}

export const SUPPORTED_ALGORITHMS = Object.keys(ALGORITHMS)
