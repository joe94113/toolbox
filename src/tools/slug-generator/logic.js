/**
 * 把標題轉成網址友善的 slug。
 * 英文字母會轉小寫；中文字元保留原樣（現代網址允許中文，
 * 例如 Medium、GitHub Discussions 的網址都是這樣），
 * 其餘符號一律換成連字號，並收斂連續的連字號。
 */
export function toSlug(text) {
  if (!text.trim()) return { ok: true, value: '' }

  const slug = text
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // 去除重音符號，例如 é → e
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-') // 非英數、非中文的字元換成連字號
    .replace(/^-+|-+$/g, '') // 去頭尾多餘的連字號
    .replace(/-{2,}/g, '-') // 收斂連續連字號

  return { ok: true, value: slug }
}
