/**
 * Unicode 跳脫轉換的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 */

export const FORMATS = [
  { value: 'js', label: 'JavaScript \\uXXXX' },
  { value: 'jsCodePoint', label: 'JavaScript \\u{XXXX}' },
  { value: 'css', label: 'CSS \\XXXX' },
  { value: 'html', label: 'HTML &#xXXXX;' },
  { value: 'python', label: 'Python \\uXXXX' },
]

/**
 * 走訪字串時用 Array.from，它會依「字碼點」拆而不是依 UTF-16 單元，
 * emoji 這種代理對才不會被切成兩半變成亂碼。
 */
export function escapeText(text, format = 'js', options = {}) {
  const { asciiOnly = true } = options
  const raw = String(text ?? '')
  if (!raw) return { ok: true, value: '' }

  const out = Array.from(raw)
    .map((ch) => {
      const code = ch.codePointAt(0)
      if (asciiOnly && code < 128) return ch

      switch (format) {
        case 'jsCodePoint':
          return `\\u{${code.toString(16).toUpperCase()}}`
        case 'css':
          return `\\${code.toString(16).toUpperCase()} `
        case 'html':
          return `&#x${code.toString(16).toUpperCase()};`
        case 'python':
        case 'js':
        default:
          // \uXXXX 只放得下 16 位元，超過的要拆成代理對
          if (code > 0xffff) {
            return ch
              .split('')
              .map((unit) => `\\u${unit.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
              .join('')
          }
          return `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`
      }
    })
    .join('')

  return { ok: true, value: out }
}

/** 各種寫法都吃，不用先選格式 */
export function unescapeText(text) {
  const raw = String(text ?? '')
  if (!raw) return { ok: true, value: '' }

  const out = raw
    // \u{1F600}
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (m, hex) => safeFromCodePoint(hex, 16, m))
    // \uXXXX
    .replace(/\\u([0-9a-fA-F]{4})/g, (m, hex) => safeFromCodePoint(hex, 16, m))
    // \xXX
    .replace(/\\x([0-9a-fA-F]{2})/g, (m, hex) => safeFromCodePoint(hex, 16, m))
    // &#xXXXX;
    .replace(/&#x([0-9a-fA-F]{1,6});/gi, (m, hex) => safeFromCodePoint(hex, 16, m))
    // &#DDDD;
    .replace(/&#(\d{1,7});/g, (m, dec) => safeFromCodePoint(dec, 10, m))
    // CSS \XXXX（可能帶一個結尾空白）
    .replace(/\\([0-9a-fA-F]{2,6})\s?/g, (m, hex) => safeFromCodePoint(hex, 16, m))

  return { ok: true, value: out }
}

/** 超出範圍或解析失敗時原樣留著，不要硬轉出亂碼或丟例外 */
function safeFromCodePoint(digits, radix, original) {
  const code = parseInt(digits, radix)
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return original
  try {
    return String.fromCodePoint(code)
  } catch {
    return original
  }
}

/** 拆出每個字元的字碼點，做成對照表 */
export function inspect(text) {
  const raw = String(text ?? '')
  if (!raw) return { ok: true, value: null }

  return {
    ok: true,
    value: Array.from(raw)
      .slice(0, 200)
      .map((ch) => {
        const code = ch.codePointAt(0)
        return {
          char: ch,
          hex: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
          decimal: code,
        }
      }),
  }
}
