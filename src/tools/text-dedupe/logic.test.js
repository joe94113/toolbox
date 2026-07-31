import { describe, it, expect } from 'vitest'
import { processLines, countOccurrences } from './logic.js'

describe('processLines', () => {
  it('預設會去空行並去重複', () => {
    const result = processLines('a\nb\n\na\nb')
    expect(result.value.lines).toEqual(['a', 'b'])
    expect(result.value.removedCount).toBe(3)
  })

  it('先 trim 才去重複，前後空白不會讓同一筆變兩筆', () => {
    expect(processLines('a\n  a  \na').value.lines).toEqual(['a'])
  })

  it('可以忽略大小寫去重複', () => {
    expect(processLines('Apple\napple', { ignoreCase: true }).value.lines).toEqual(['Apple'])
  })

  it('不忽略大小寫時是兩筆', () => {
    expect(processLines('Apple\napple').value.lines).toEqual(['Apple', 'apple'])
  })

  it('可以關掉去重複只做排序', () => {
    expect(processLines('b\na\nb', { dedupe: false, sort: 'asc' }).value.lines).toEqual([
      'a',
      'b',
      'b',
    ])
  })

  it('排序時數字照大小排，不是照字串排', () => {
    expect(processLines('item10\nitem2', { sort: 'asc' }).value.lines).toEqual([
      'item2',
      'item10',
    ])
  })

  it('可以倒序排', () => {
    expect(processLines('a\nb\nc', { sort: 'desc' }).value.lines).toEqual(['c', 'b', 'a'])
  })

  it('可以單純把行反過來', () => {
    expect(processLines('a\nb\nc', { reverse: true }).value.lines).toEqual(['c', 'b', 'a'])
  })

  it('回報處理前後的行數', () => {
    const result = processLines('a\na\nb')
    expect(result.value.originalCount).toBe(3)
    expect(result.value.resultCount).toBe(2)
  })

  it('空字串回傳空結果', () => {
    expect(processLines('')).toEqual({ ok: true, value: null })
  })
})

describe('countOccurrences', () => {
  it('算得出每行出現次數，由多到少', () => {
    expect(countOccurrences('a\nb\na\nc\na').value).toEqual([
      { text: 'a', count: 3 },
      { text: 'b', count: 1 },
      { text: 'c', count: 1 },
    ])
  })

  it('可以忽略大小寫合併計算', () => {
    expect(countOccurrences('A\na', { ignoreCase: true }).value).toEqual([
      { text: 'A', count: 2 },
    ])
  })

  it('空字串回傳空結果', () => {
    expect(countOccurrences('')).toEqual({ ok: true, value: null })
  })
})
