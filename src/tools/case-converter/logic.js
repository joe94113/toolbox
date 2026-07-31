/**
 * 命名格式轉換的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 */

/**
 * 把各種寫法拆成一個個單字，是所有轉換的共同第一步。
 * 處理三種邊界：分隔符號、camelCase 的大小寫交界、連續大寫後接單字（HTTPServer）。
 */
export function splitWords(text) {
  return String(text ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[\s_\-.]+/)
    .filter(Boolean)
}

const upperFirst = (w) => w.charAt(0).toUpperCase() + w.slice(1)

export function convertCase(text) {
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: null }

  const words = splitWords(raw)
  if (!words.length) {
    return { ok: false, error: '這段文字裡找不到可以轉換的單字' }
  }

  const lower = words.map((w) => w.toLowerCase())

  return {
    ok: true,
    value: {
      camel: lower.map((w, i) => (i === 0 ? w : upperFirst(w))).join(''),
      pascal: lower.map(upperFirst).join(''),
      snake: lower.join('_'),
      kebab: lower.join('-'),
      constant: lower.join('_').toUpperCase(),
      dot: lower.join('.'),
      title: lower.map(upperFirst).join(' '),
      sentence: upperFirst(lower.join(' ')),
      lower: lower.join(' '),
      upper: lower.join(' ').toUpperCase(),
    },
  }
}
