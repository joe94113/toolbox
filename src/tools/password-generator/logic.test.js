import { describe, it, expect } from 'vitest'
import { generatePassword } from './logic.js'

describe('generatePassword', () => {
  it('產生指定長度的密碼', () => {
    const result = generatePassword({ length: 20 })
    expect(result.ok).toBe(true)
    expect(result.value.password).toHaveLength(20)
  })

  it('沒有勾選任何字元類型時回傳錯誤', () => {
    const result = generatePassword({ lower: false, upper: false, numbers: false, symbols: false })
    expect(result.ok).toBe(false)
  })

  it('長度不合法時回傳錯誤', () => {
    expect(generatePassword({ length: 2 }).ok).toBe(false)
    expect(generatePassword({ length: 200 }).ok).toBe(false)
  })

  it('只勾數字時，密碼只含數字', () => {
    const result = generatePassword({ length: 30, lower: false, upper: false, numbers: true, symbols: false })
    expect(result.value.password).toMatch(/^[0-9]+$/)
  })

  it('每次產生的密碼幾乎不會一樣（隨機性檢查）', () => {
    const a = generatePassword({ length: 16 }).value.password
    const b = generatePassword({ length: 16 }).value.password
    expect(a).not.toBe(b)
  })

  it('回傳的強度字串是四個等級之一', () => {
    const result = generatePassword({ length: 16 })
    expect(['弱', '普通', '強', '非常強']).toContain(result.value.strength)
  })
})
