import { describe, it, expect } from 'vitest'
import { parseCron } from './logic.js'

describe('parseCron', () => {
  it('產生中文說明', () => {
    const result = parseCron('*/5 * * * *')
    expect(result.ok).toBe(true)
    expect(result.value.description).toContain('5 分鐘')
  })

  it('算出接下來 5 次執行時間', () => {
    const result = parseCron('0 9 * * *')
    expect(result.ok).toBe(true)
    expect(result.value.nextRuns).toHaveLength(5)
  })

  it('不合法的 cron 表達式回傳錯誤', () => {
    const result = parseCron('not a cron')
    expect(result.ok).toBe(false)
  })

  it('空字串視為空輸出', () => {
    expect(parseCron('')).toEqual({ ok: true, value: null })
  })
})
