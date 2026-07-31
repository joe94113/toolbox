import { describe, it, expect } from 'vitest'
import { decodeJwt } from './logic.js'

// jwt.io 上公開的範例 token（不含任何真實使用者資料）
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('decodeJwt', () => {
  it('解出 header 跟 payload', () => {
    const result = decodeJwt(SAMPLE)
    expect(result.ok).toBe(true)
    expect(result.value.header).toContain('"alg": "HS256"')
    expect(result.value.payload).toContain('"name": "John Doe"')
  })

  it('偵測有沒有簽章段', () => {
    expect(decodeJwt(SAMPLE).value.signaturePresent).toBe(true)
  })

  it('不是三段格式時回傳好懂的錯誤', () => {
    const result = decodeJwt('not.a.jwt.token.extra')
    expect(result.ok).toBe(false)
  })

  it('段落不是合法 base64/JSON 時回傳錯誤', () => {
    const result = decodeJwt('abc.def.ghi')
    expect(result.ok).toBe(false)
  })

  it('空字串視為空輸出', () => {
    expect(decodeJwt('')).toEqual({ ok: true, value: null })
  })
})
