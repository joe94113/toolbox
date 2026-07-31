import { describe, it, expect } from 'vitest'
import { parseCsv } from './logic.js'

describe('parseCsv', () => {
  it('把第一列當標題，其餘當資料列', () => {
    const result = parseCsv('name,age\nAlice,30\nBob,25')
    expect(result.ok).toBe(true)
    expect(result.value.headers).toEqual(['name', 'age'])
    expect(result.value.rows).toEqual([
      ['Alice', '30'],
      ['Bob', '25'],
    ])
  })

  it('正確處理有逗號在引號裡的欄位', () => {
    const result = parseCsv('name,note\n"Chen, John",hello')
    expect(result.value.rows[0]).toEqual(['Chen, John', 'hello'])
  })

  it('空字串視為空輸出', () => {
    expect(parseCsv('')).toEqual({ ok: true, value: null })
  })

  it('忽略空白行', () => {
    const result = parseCsv('a,b\n1,2\n\n3,4')
    expect(result.value.rows).toHaveLength(2)
  })
})
