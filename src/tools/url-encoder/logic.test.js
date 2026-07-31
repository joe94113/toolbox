import { describe, it, expect } from 'vitest'
import { encodeUrl, decodeUrl } from './logic.js'

describe('encodeUrl', () => {
  it('把特殊字元跟空白編碼成安全格式', () => {
    expect(encodeUrl('a b&c=d')).toEqual({ ok: true, value: 'a%20b%26c%3Dd' })
  })
  it('正確處理中文字', () => {
    const result = encodeUrl('你好')
    expect(result.ok).toBe(true)
    expect(decodeUrl(result.value).value).toBe('你好')
  })
  it('空字串回傳空結果', () => {
    expect(encodeUrl('')).toEqual({ ok: true, value: '' })
  })
})

describe('decodeUrl', () => {
  it('把編碼過的內容還原成原文', () => {
    expect(decodeUrl('a%20b%26c%3Dd')).toEqual({ ok: true, value: 'a b&c=d' })
  })
  it('不合法的內容回傳好懂的錯誤訊息', () => {
    const result = decodeUrl('%E4%')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('不是合法的 URL 編碼')
  })
  it('空字串視為空輸出', () => {
    expect(decodeUrl('')).toEqual({ ok: true, value: '' })
  })
})
