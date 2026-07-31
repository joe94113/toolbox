import { describe, it, expect } from 'vitest'
import { computeHash } from './logic.js'

describe('computeHash', () => {
  it('算出已知字串的 SHA-256（可跟其他工具對照的公開測試向量）', async () => {
    const result = await computeHash('hello', 'SHA-256')
    expect(result.ok).toBe(true)
    expect(result.value).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })

  it('算出已知字串的 SHA-1', async () => {
    const result = await computeHash('hello', 'SHA-1')
    expect(result.value).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })

  it('空字串回傳空結果，不呼叫 crypto', async () => {
    expect(await computeHash('', 'SHA-256')).toEqual({ ok: true, value: '' })
  })

  it('不支援的演算法回傳錯誤', async () => {
    const result = await computeHash('hello', 'MD5')
    expect(result.ok).toBe(false)
  })
})
