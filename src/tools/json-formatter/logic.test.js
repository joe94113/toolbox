import { describe, it, expect } from 'vitest'
import { formatJson } from './logic.js'

describe('formatJson', () => {
  it('用 2 格縮排格式化合法的 JSON', () => {
    const result = formatJson('{"a":1}', 2)
    expect(result.ok).toBe(true)
    expect(result.value).toBe('{\n  "a": 1\n}')
  })

  it('縮排設為 0 時輸出壓縮後的單行 JSON', () => {
    const result = formatJson('{ "a" : 1 }', 0)
    expect(result.ok).toBe(true)
    expect(result.value).toBe('{"a":1}')
  })

  it('內容不是合法 JSON 時回傳錯誤而不是丟出例外', () => {
    const result = formatJson('{a:1}', 2)
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('空字串視為空輸出，不是錯誤', () => {
    const result = formatJson('', 2)
    expect(result).toEqual({ ok: true, value: '' })
  })

  it('保留巢狀結構與陣列', () => {
    const result = formatJson('{"list":[1,{"b":true}]}', 2)
    expect(result.value).toBe('{\n  "list": [\n    1,\n    {\n      "b": true\n    }\n  ]\n}')
  })
})
