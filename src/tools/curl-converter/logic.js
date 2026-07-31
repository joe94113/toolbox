/**
 * curl 指令轉程式碼的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 */

/**
 * 依 shell 規則切詞：引號內的空白不算分隔，反斜線換行要先接起來。
 * 不能直接用 split(' ')，那樣帶空白的 header 或 JSON body 會被切爛。
 */
export function tokenize(command) {
  const text = String(command ?? '').replace(/\\\r?\n/g, ' ')
  const tokens = []
  let current = ''
  let quote = null
  let started = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (quote) {
      if (ch === '\\' && quote === '"' && i + 1 < text.length) {
        current += text[++i]
      } else if (ch === quote) {
        quote = null
      } else {
        current += ch
      }
      continue
    }

    if (ch === '"' || ch === "'") {
      quote = ch
      started = true
      continue
    }

    if (/\s/.test(ch)) {
      if (started || current) tokens.push(current)
      current = ''
      started = false
      continue
    }

    current += ch
    started = true
  }

  if (quote) return { ok: false, error: '引號沒有收尾，指令看起來不完整' }
  if (started || current) tokens.push(current)

  return { ok: true, value: tokens }
}

const METHOD_FLAGS = new Set(['-X', '--request'])
const HEADER_FLAGS = new Set(['-H', '--header'])
const DATA_FLAGS = new Set(['-d', '--data', '--data-raw', '--data-binary', '--data-ascii'])
const USER_FLAGS = new Set(['-u', '--user'])
// 這些旗標對轉出來的程式碼沒有影響，安靜略過就好
const IGNORED_NO_ARG = new Set([
  '-s', '--silent', '-k', '--insecure', '-L', '--location',
  '-i', '--include', '-v', '--verbose', '-g', '--globoff', '--compressed',
])
const IGNORED_WITH_ARG = new Set(['-o', '--output', '-w', '--write-out', '--max-time', '--connect-timeout'])

export function parseCurl(command) {
  const raw = String(command ?? '').trim()
  if (!raw) return { ok: true, value: null }

  const tokenized = tokenize(raw)
  if (!tokenized.ok) return tokenized

  const tokens = tokenized.value
  if (!tokens.length || !/^curl$/i.test(tokens[0])) {
    return { ok: false, error: '指令要以 curl 開頭' }
  }

  const result = { url: '', method: '', headers: {}, body: null, auth: null }

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i]

    if (METHOD_FLAGS.has(token)) {
      result.method = (tokens[++i] || '').toUpperCase()
    } else if (HEADER_FLAGS.has(token)) {
      const header = tokens[++i] || ''
      const idx = header.indexOf(':')
      if (idx > 0) {
        result.headers[header.slice(0, idx).trim()] = header.slice(idx + 1).trim()
      }
    } else if (DATA_FLAGS.has(token)) {
      const chunk = tokens[++i] || ''
      // 多個 -d 會被 curl 用 & 串起來，這裡照做
      result.body = result.body === null ? chunk : `${result.body}&${chunk}`
    } else if (USER_FLAGS.has(token)) {
      result.auth = tokens[++i] || ''
    } else if (IGNORED_WITH_ARG.has(token)) {
      i++
    } else if (IGNORED_NO_ARG.has(token)) {
      continue
    } else if (token.startsWith('-')) {
      continue
    } else if (!result.url) {
      result.url = token
    }
  }

  if (!result.url) {
    return { ok: false, error: '找不到網址' }
  }

  // 沒寫 -X 時，有 body 就是 POST，否則 GET——跟 curl 的行為一致
  if (!result.method) {
    result.method = result.body !== null ? 'POST' : 'GET'
  }

  return { ok: true, value: result }
}

function looksLikeJson(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}

export function toFetch(parsed) {
  if (!parsed) return ''

  const headers = { ...parsed.headers }
  if (parsed.auth) {
    // btoa 在瀏覽器與 Node 都有，這裡只組字串不實際編碼，讓產生的程式碼自己算
    headers.Authorization = `Basic ${'${btoa(' + JSON.stringify(parsed.auth) + ')}'}`
  }

  const lines = [`await fetch(${JSON.stringify(parsed.url)}, {`]
  lines.push(`  method: ${JSON.stringify(parsed.method)},`)

  if (Object.keys(headers).length) {
    lines.push('  headers: {')
    for (const [key, value] of Object.entries(headers)) {
      const rendered = value.includes('${')
        ? `\`${value}\``
        : JSON.stringify(value)
      lines.push(`    ${JSON.stringify(key)}: ${rendered},`)
    }
    lines.push('  },')
  }

  if (parsed.body !== null) {
    if (looksLikeJson(parsed.body)) {
      lines.push(`  body: JSON.stringify(${JSON.stringify(JSON.parse(parsed.body))}),`)
    } else {
      lines.push(`  body: ${JSON.stringify(parsed.body)},`)
    }
  }

  lines.push('})')
  return lines.join('\n')
}

export function convert(command) {
  const parsed = parseCurl(command)
  if (!parsed.ok) return parsed
  if (!parsed.value) return { ok: true, value: null }
  return { ok: true, value: { parsed: parsed.value, code: toFetch(parsed.value) } }
}
