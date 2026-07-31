import { describe, it, expect } from 'vitest'
import { encodeBase64, decodeBase64 } from './logic.js'

describe('encodeBase64', () => {
  it('把英文文字編碼成 Base64', () => {
    expect(encodeBase64('hello')).toEqual({ ok: true, value: 'aGVsbG8=' })
  })

  it('正確處理中文字', () => {
    const result = encodeBase64('你好')
    expect(result.ok).toBe(true)
    expect(decodeBase64(result.value).value).toBe('你好')
  })

  it('空字串回傳空結果', () => {
    expect(encodeBase64('')).toEqual({ ok: true, value: '' })
  })
})

describe('decodeBase64', () => {
  it('把合法 Base64 還原成原文', () => {
    expect(decodeBase64('aGVsbG8=')).toEqual({ ok: true, value: 'hello' })
  })

  it('不合法的內容回傳好懂的錯誤訊息，不是瀏覽器原生例外', () => {
    const result = decodeBase64('這不是 base64！！')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('不是合法的 Base64')
  })

  it('空字串視為空輸出，不是錯誤', () => {
    expect(decodeBase64('')).toEqual({ ok: true, value: '' })
  })
})
