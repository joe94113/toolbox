/**
 * 進位轉換的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 全程用 BigInt，才不會在超過 2^53 的時候悄悄算錯
 * （雜湊值、雪花 ID 這類大數字很容易踩到）。
 */

const PREFIXES = {
  '0x': 16,
  '0b': 2,
  '0o': 8,
}

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

/** 依 base 檢查每個字元都在合法範圍內 */
function isValidForBase(text, base) {
  const allowed = DIGITS.slice(0, base)
  return text.split('').every((c) => allowed.includes(c.toLowerCase()))
}

/**
 * 解析輸入的數字。base 傳 'auto' 時會看 0x / 0b / 0o 前綴自己判斷，
 * 沒有前綴就當作十進位。
 */
export function parseNumber(input, base = 'auto') {
  const text = String(input ?? '').trim().replace(/[\s_,]/g, '')
  if (!text) return { ok: true, value: null }

  const negative = text.startsWith('-')
  const body = negative ? text.slice(1) : text

  let digits = body
  let radix = base

  if (base === 'auto') {
    const prefix = body.slice(0, 2).toLowerCase()
    if (PREFIXES[prefix]) {
      radix = PREFIXES[prefix]
      digits = body.slice(2)
    } else {
      radix = 10
    }
  } else {
    // 明確指定 base 時，仍然容許使用者順手貼上前綴
    const prefix = body.slice(0, 2).toLowerCase()
    if (PREFIXES[prefix] === Number(base)) digits = body.slice(2)
    radix = Number(base)
  }

  if (!digits) {
    return { ok: false, error: '只有前綴，後面沒有數字' }
  }
  if (!isValidForBase(digits, radix)) {
    return { ok: false, error: `「${digits}」不是合法的 ${radix} 進位數字` }
  }

  let n = 0n
  const bigRadix = BigInt(radix)
  for (const c of digits.toLowerCase()) {
    n = n * bigRadix + BigInt(DIGITS.indexOf(c))
  }
  if (negative) n = -n

  return { ok: true, value: n }
}

/** 把 BigInt 轉成各種進位的字串表示 */
export function formatBases(n) {
  const sign = n < 0n ? '-' : ''
  const abs = n < 0n ? -n : n
  return {
    bin: sign + abs.toString(2),
    oct: sign + abs.toString(8),
    dec: n.toString(10),
    hex: sign + abs.toString(16).toUpperCase(),
  }
}

/** 畫面用的一步到位版本 */
export function convert(input, base = 'auto') {
  const parsed = parseNumber(input, base)
  if (!parsed.ok) return parsed
  if (parsed.value === null) return { ok: true, value: null }
  return { ok: true, value: formatBases(parsed.value) }
}
