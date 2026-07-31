import { describe, it, expect } from 'vitest'
import { countText } from './logic.js'

describe('countText', () => {
  it('空字串全部算 0', () => {
    expect(countText('')).toEqual({
      ok: true,
      value: { chars: 0, charsNoSpace: 0, words: 0, lines: 0, bytes: 0 },
    })
  })

  it('計算字數與不含空白字數', () => {
    const result = countText('hello world')
    expect(result.value.chars).toBe(11)
    expect(result.value.charsNoSpace).toBe(10)
    expect(result.value.words).toBe(2)
  })

  it('計算行數', () => {
    const result = countText('第一行\n第二行\n第三行')
    expect(result.value.lines).toBe(3)
  })

  it('中文字的位元組數是字數的 3 倍（UTF-8）', () => {
    const result = countText('中文')
    expect(result.value.chars).toBe(2)
    expect(result.value.bytes).toBe(6)
  })
})
