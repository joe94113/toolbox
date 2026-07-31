/**
 * 文字整理（去重複、排序、去空行）的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 */

/**
 * 處理順序是刻意排的：先 trim 再去空行，最後才去重複與排序。
 * 反過來的話「a」和「a 」會被當成兩筆不同資料，去重複就失效了。
 */
export function processLines(text, options = {}) {
  const {
    trim = true,
    removeEmpty = true,
    dedupe = true,
    ignoreCase = false,
    sort = 'none', // none | asc | desc
    reverse = false,
  } = options

  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: null }

  let lines = raw.split(/\r?\n/)
  const originalCount = lines.length

  if (trim) lines = lines.map((l) => l.trim())
  if (removeEmpty) lines = lines.filter((l) => l !== '')

  if (dedupe) {
    const seen = new Set()
    lines = lines.filter((l) => {
      const key = ignoreCase ? l.toLowerCase() : l
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  if (sort !== 'none') {
    // localeCompare 帶 numeric，這樣 item2 會排在 item10 前面
    const collator = new Intl.Collator('zh-Hant', { numeric: true, sensitivity: 'base' })
    lines = [...lines].sort((a, b) => collator.compare(a, b))
    if (sort === 'desc') lines.reverse()
  }

  if (reverse) lines = [...lines].reverse()

  return {
    ok: true,
    value: {
      text: lines.join('\n'),
      lines,
      originalCount,
      resultCount: lines.length,
      removedCount: originalCount - lines.length,
    },
  }
}

/** 算出每一行出現幾次，由多到少排序 */
export function countOccurrences(text, options = {}) {
  const { ignoreCase = false } = options
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: null }

  const counts = new Map()
  for (const line of raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const key = ignoreCase ? line.toLowerCase() : line
    const entry = counts.get(key)
    if (entry) entry.count++
    else counts.set(key, { text: line, count: 1 })
  }

  return {
    ok: true,
    value: [...counts.values()].sort((a, b) => b.count - a.count || a.text.localeCompare(b.text)),
  }
}
