import { describe, it, expect } from 'vitest'
import { timestampToDate, dateToTimestamp } from './logic.js'

describe('timestampToDate', () => {
  it('10 碼視為秒，換算出正確的 UTC 時間', () => {
    const result = timestampToDate('1700000000')
    expect(result.ok).toBe(true)
    expect(result.value.utc).toBe('2023-11-14T22:13:20.000Z')
  })

  it('13 碼視為毫秒', () => {
    const result = timestampToDate('1700000000000')
    expect(result.ok).toBe(true)
    expect(result.value.utc).toBe('2023-11-14T22:13:20.000Z')
  })

  it('不是數字時回傳好懂的錯誤訊息', () => {
    const result = timestampToDate('abc')
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('空字串視為空輸出', () => {
    expect(timestampToDate('')).toEqual({ ok: true, value: null })
  })
})

describe('dateToTimestamp', () => {
  it('把 ISO 日期字串換算成秒與毫秒', () => {
    const result = dateToTimestamp('2023-11-14T22:13:20.000Z')
    expect(result.ok).toBe(true)
    expect(result.value.seconds).toBe('1700000000')
    expect(result.value.milliseconds).toBe('1700000000000')
  })

  it('看不懂的日期格式回傳錯誤', () => {
    const result = dateToTimestamp('不是日期')
    expect(result.ok).toBe(false)
  })

  it('空字串視為空輸出', () => {
    expect(dateToTimestamp('')).toEqual({ ok: true, value: null })
  })
})
