import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ breaks: true, gfm: true })

/**
 * 把 Markdown 轉成 HTML。一定會先用 DOMPurify 消毒過，
 * 避免貼進來的內容裡藏了會執行的 script 或危險屬性。
 */
export function renderMarkdown(text) {
  if (!text.trim()) return { ok: true, value: '' }
  const rawHtml = marked.parse(text)
  const cleanHtml = DOMPurify.sanitize(rawHtml)
  return { ok: true, value: cleanHtml }
}
