import { describe, it, expect } from 'vitest'
import { testRegex } from './logic.js'

describe('testRegex', () => {
  it('找出所有符合的片段', () => {
    const result = testRegex('\\d+', '', 'a12b34c')
    expect(result.ok).toBe(true)
    expect(result.value.matches.map((m) => m.text)).toEqual(['12', '34'])
  })

  it('沒有 pattern 時整段文字都算不匹配', () => {
    const result = testRegex('', '', 'hello')
    expect(result.value.segments).toEqual([{ text: 'hello', matched: false }])
  })

  it('不合法的正規表達式回傳好懂的錯誤', () => {
    const result = testRegex('(', '', 'hello')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('不是合法的正規表達式')
  })

  it('i 旗標可以忽略大小寫', () => {
    const result = testRegex('hello', 'i', 'HELLO world')
    expect(result.value.matches).toHaveLength(1)
  })

  it('抓得到擷取群組', () => {
    const result = testRegex('(\\w+)@(\\w+)', '', 'contact me@example')
    expect(result.value.matches[0].groups).toEqual(['me', 'example'])
  })

  it('零寬度匹配不會造成無限迴圈', () => {
    const result = testRegex('x*', '', 'abc')
    expect(result.ok).toBe(true)
  })
})
