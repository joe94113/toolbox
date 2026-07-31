import { describe, it, expect } from 'vitest'
import { jsonToTable } from './logic.js'

describe('jsonToTable', () => {
  it('物件陣列排成表格，欄位是所有 key 的聯集', () => {
    const result = jsonToTable('[{"name":"Alice","age":30},{"name":"Bob"}]')
    expect(result.ok).toBe(true)
    expect(result.value.headers).toEqual(['name', 'age'])
    expect(result.value.rows).toEqual([
      ['Alice', '30'],
      ['Bob', ''],
    ])
  })

  it('純數值/字串陣列排成單欄表格', () => {
    const result = jsonToTable('[1, 2, "three"]')
    expect(result.value.headers).toEqual(['值'])
    expect(result.value.rows).toEqual([['1'], ['2'], ['three']])
  })

  it('巢狀物件/陣列的欄位顯示成 JSON 字串', () => {
    const result = jsonToTable('[{"tags":["a","b"]}]')
    expect(result.value.rows[0][0]).toBe('["a","b"]')
  })

  it('不是陣列時回傳好懂的錯誤', () => {
    const result = jsonToTable('{"a":1}')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('JSON 陣列')
  })

  it('不合法的 JSON 回傳錯誤', () => {
    expect(jsonToTable('{a:1}').ok).toBe(false)
  })

  it('空字串視為空輸出', () => {
    expect(jsonToTable('')).toEqual({ ok: true, value: null })
  })
})
