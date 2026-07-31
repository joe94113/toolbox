import { describe, it, expect } from 'vitest'
import { compareText } from './logic.js'

describe('compareText', () => {
  it('兩段完全相同的文字，沒有變化', () => {
    const result = compareText('hello\nworld', 'hello\nworld', 'lines')
    expect(result.value.hasChange).toBe(false)
  })

  it('抓出新增跟刪除的行', () => {
    const result = compareText('a\nb\nc', 'a\nx\nc', 'lines')
    expect(result.value.hasChange).toBe(true)
    expect(result.value.parts.some((p) => p.removed && p.text.includes('b'))).toBe(true)
    expect(result.value.parts.some((p) => p.added && p.text.includes('x'))).toBe(true)
  })

  it('逐字模式可以抓到單字層級的差異', () => {
    const result = compareText('今天天氣真好', '今天天氣真差', 'words')
    expect(result.value.hasChange).toBe(true)
  })
})
