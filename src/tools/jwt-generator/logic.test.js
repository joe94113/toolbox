import { describe, it, expect } from 'vitest'
import { sign, verify, base64UrlEncode, base64UrlDecode, buildClaims } from './logic.js'

describe('base64url', () => {
  it('去掉結尾的等號', () => {
    expect(base64UrlEncode(new TextEncoder().encode('a'))).not.toContain('=')
  })

  it('用 - 和 _ 取代 + 和 /', () => {
    const encoded = base64UrlEncode(new Uint8Array([251, 255]))
    expect(encoded).not.toMatch(/[+/]/)
  })

  it('來回轉換一致', () => {
    expect(base64UrlDecode(base64UrlEncode(new TextEncoder().encode('你好 world')))).toBe(
      '你好 world'
    )
  })
})

describe('sign', () => {
  it('產生三段式的 token', async () => {
    const result = await sign('{"sub":"123"}', 'secret')
    expect(result.ok).toBe(true)
    expect(result.value.token.split('.')).toHaveLength(3)
  })

  it('對照 RFC 7519 範例的已知輸出', async () => {
    // HS256、密鑰 "your-256-bit-secret"，這是 jwt.io 首頁的經典範例
    const payload = '{"sub":"1234567890","name":"John Doe","iat":1516239022}'
    const result = await sign(payload, 'your-256-bit-secret')
    expect(result.value.token).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    )
  })

  it('header 帶上正確的演算法', async () => {
    const result = await sign('{}', 'k', 'HS512')
    expect(result.value.header).toEqual({ alg: 'HS512', typ: 'JWT' })
  })

  it('不同演算法產生不同簽章', async () => {
    const a = await sign('{"a":1}', 'k', 'HS256')
    const b = await sign('{"a":1}', 'k', 'HS512')
    expect(a.value.token).not.toBe(b.value.token)
  })

  it('沒填密鑰會擋下來', async () => {
    expect((await sign('{}', '')).ok).toBe(false)
  })

  it('payload 不是合法 JSON 會擋下來', async () => {
    expect((await sign('{壞掉}', 'k')).ok).toBe(false)
  })

  it('payload 是陣列會擋下來', async () => {
    expect((await sign('[1,2]', 'k')).ok).toBe(false)
  })

  it('不支援的演算法會擋下來', async () => {
    expect((await sign('{}', 'k', 'RS256')).ok).toBe(false)
  })
})

describe('verify', () => {
  it('密鑰正確時驗得過', async () => {
    const signed = await sign('{"sub":"a"}', 'secret')
    const result = await verify(signed.value.token, 'secret')
    expect(result.value.valid).toBe(true)
  })

  it('密鑰錯誤時驗不過', async () => {
    const signed = await sign('{"sub":"a"}', 'secret')
    const result = await verify(signed.value.token, 'wrong')
    expect(result.value.valid).toBe(false)
  })

  it('段數不對會回報錯誤', async () => {
    expect((await verify('abc.def', 'k')).ok).toBe(false)
  })

  it('非 HMAC 演算法會說明驗不了', async () => {
    // alg 是 RS256 的 header
    const header = base64UrlEncode(new TextEncoder().encode('{"alg":"RS256","typ":"JWT"}'))
    const result = await verify(`${header}.e30.sig`, 'k')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('RS256')
  })
})

describe('buildClaims', () => {
  it('一定會有 iat', () => {
    expect(buildClaims({})).toHaveProperty('iat')
  })

  it('有效期會加在 iat 之上', () => {
    const claims = buildClaims({ expiresInSeconds: 3600 })
    expect(claims.exp - claims.iat).toBe(3600)
  })

  it('有效期為 0 時不加 exp', () => {
    expect(buildClaims({ expiresInSeconds: 0 })).not.toHaveProperty('exp')
  })

  it('空欄位不會被塞進去', () => {
    const claims = buildClaims({ subject: '', issuer: 'me' })
    expect(claims).not.toHaveProperty('sub')
    expect(claims.iss).toBe('me')
  })
})
