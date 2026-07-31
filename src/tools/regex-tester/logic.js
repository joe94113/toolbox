/**
 * 用 pattern + flags 測試一段文字，回傳切好片段的陣列
 * （matched: true/false），畫面端直接依此上色即可。
 * 也回傳每個匹配的擷取群組，方便確認 group 有沒有抓對。
 */
export function testRegex(pattern, flags, text) {
  if (!pattern) {
    return { ok: true, value: { segments: [{ text, matched: false }], matches: [] } }
  }

  let regex
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
  } catch (e) {
    return { ok: false, error: `這不是合法的正規表達式：${e.message}` }
  }

  const segments = []
  const matches = []
  let lastIndex = 0
  let match

  // 避免零寬度匹配造成無限迴圈
  let guard = 0
  while ((match = regex.exec(text)) !== null && guard < 5000) {
    guard++
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), matched: false })
    }
    segments.push({ text: match[0], matched: true })
    matches.push({ text: match[0], groups: match.slice(1), index: match.index })
    lastIndex = match.index + match[0].length
    if (match[0].length === 0) regex.lastIndex++
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), matched: false })
  }

  return { ok: true, value: { segments, matches } }
}
