/**
 * HTML 實體編碼／解碼的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 刻意不用 innerHTML 那套偷吃步：那個做法在 Node 測試環境跑不了，
 * 而且把使用者的字串塞進 DOM 本身就不是好習慣。
 */

// 一定要編碼的五個字元，其他字元保持原樣才不會把中文也變成一坨 &#...;
const ENCODE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  middot: '·',
  times: '×',
  divide: '÷',
  deg: '°',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  para: '¶',
  laquo: '«',
  raquo: '»',
}

export function encodeEntities(text, options = {}) {
  const { encodeNonAscii = false } = options
  const raw = String(text ?? '')
  if (!raw) return { ok: true, value: '' }

  let out = raw.replace(/[&<>"']/g, (c) => ENCODE_MAP[c])

  if (encodeNonAscii) {
    // 用 Array.from 走訪，這樣 emoji 這種代理對才不會被拆成兩半變成亂碼
    out = Array.from(out)
      .map((ch) => (ch.codePointAt(0) > 127 ? `&#${ch.codePointAt(0)};` : ch))
      .join('')
  }

  return { ok: true, value: out }
}

export function decodeEntities(text) {
  const raw = String(text ?? '')
  if (!raw) return { ok: true, value: '' }

  const out = raw.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (match, body) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X'
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10)
      // 超出 Unicode 範圍或解析失敗就原樣留著，不要硬轉出亂碼
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match
      return String.fromCodePoint(code)
    }
    const named = NAMED_ENTITIES[body.toLowerCase()]
    return named === undefined ? match : named
  })

  return { ok: true, value: out }
}
