import { describe, it, expect } from 'vitest'
import { renderMarkdown } from './logic.js'

describe('renderMarkdown', () => {
  it('把標題跟粗體轉成對應的 HTML', () => {
    const result = renderMarkdown('# 標題\n**粗體**')
    expect(result.ok).toBe(true)
    expect(result.value).toContain('<h1>標題</h1>')
    expect(result.value).toContain('<strong>粗體</strong>')
  })

  it('把清單轉成 <ul><li>', () => {
    const result = renderMarkdown('- a\n- b')
    expect(result.value).toContain('<li>a</li>')
  })

  it('會擋掉 <script> 標籤，避免執行任意程式碼', () => {
    const result = renderMarkdown('<script>alert(1)</script>')
    expect(result.value).not.toContain('<script>')
  })

  it('會擋掉危險的事件屬性，例如 onerror', () => {
    const result = renderMarkdown('<img src=x onerror="alert(1)">')
    expect(result.value).not.toContain('onerror')
  })

  it('空字串回傳空結果', () => {
    expect(renderMarkdown('')).toEqual({ ok: true, value: '' })
  })
})
