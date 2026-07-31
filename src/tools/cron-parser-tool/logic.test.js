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

  it('錯誤訊息不會出現 undefined', () => {
    // cronstrue 丟的是字串不是 Error，讀 e.message 會拿到 undefined
    for (const bad of ['not a cron', '* * *', '0 99 * * *']) {
      const result = parseCron(bad)
      expect(result.ok, bad).toBe(false)
      expect(result.error, bad).not.toContain('undefined')
    }
  })

  it('空字串視為空輸出', () => {
    expect(parseCron('')).toEqual({ ok: true, value: null })
  })
})
