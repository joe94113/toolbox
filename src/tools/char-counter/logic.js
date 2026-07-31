/**
 * 統計文字的字數、不含空白字數、行數、位元組數（UTF-8）。
 * 永遠回傳 ok:true，因為統計沒有「失敗」這種狀態，空字串就是全部算 0。
 */
export function countText(text) {
  const chars = [...text].length // 用展開運算子正確計算 emoji 等多位元字元
  const charsNoSpace = [...text.replace(/\s/g, '')].length
  const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const bytes = new TextEncoder().encode(text).length

  return {
    ok: true,
    value: { chars, charsNoSpace, words, lines, bytes },
  }
}
