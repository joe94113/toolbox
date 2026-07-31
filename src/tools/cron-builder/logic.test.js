import { describe as group, it, expect } from 'vitest'
import { buildExpression, compactField, describe, PRESETS } from './logic.js'

group('compactField', () => {
  it('全選時壓成星號', () => {
    expect(compactField([0, 1, 2, 3, 4, 5, 6], 7)).toBe('*')
  })

  it('沒選時也是星號', () => {
    expect(compactField([], 7)).toBe('*')
  })

  it('部分選取時列出來並排序', () => {
    expect(compactField([5, 1, 3], 7)).toBe('1,3,5')
  })

  it('重複的值只留一份', () => {
    expect(compactField([1, 1, 2], 7)).toBe('1,2')
  })
})

group('buildExpression', () => {
  it('每分鐘', () => {
    expect(buildExpression({ frequency: 'everyMinute' }).value).toBe('* * * * *')
  })

  it('每 N 分鐘', () => {
    expect(buildExpression({ frequency: 'everyNMinutes', interval: 15 }).value).toBe(
      '*/15 * * * *'
    )
  })

  it('間隔超出範圍會擋下來', () => {
    expect(buildExpression({ frequency: 'everyNMinutes', interval: 0 }).ok).toBe(false)
    expect(buildExpression({ frequency: 'everyNMinutes', interval: 60 }).ok).toBe(false)
  })

  it('每小時的第幾分', () => {
    expect(buildExpression({ frequency: 'hourly', minute: 30 }).value).toBe('30 * * * *')
  })

  it('每天幾點幾分', () => {
    expect(buildExpression({ frequency: 'daily', hour: 9, minute: 5 }).value).toBe('5 9 * * *')
  })

  it('每週指定星期幾', () => {
    expect(
      buildExpression({ frequency: 'weekly', hour: 9, minute: 0, weekdays: [1, 3, 5] }).value
    ).toBe('0 9 * * 1,3,5')
  })

  it('每週沒選星期幾會擋下來', () => {
    expect(buildExpression({ frequency: 'weekly', weekdays: [] }).ok).toBe(false)
  })

  it('每月指定日期', () => {
    expect(buildExpression({ frequency: 'monthly', dayOfMonth: 15, hour: 8, minute: 0 }).value).toBe(
      '0 8 15 * *'
    )
  })

  it('每月日期超出範圍會擋下來', () => {
    expect(buildExpression({ frequency: 'monthly', dayOfMonth: 32 }).ok).toBe(false)
  })
})

group('describe', () => {
  it('組出來的表達式一定解析得過', () => {
    const built = buildExpression({ frequency: 'daily', hour: 9, minute: 30 })
    const result = describe(built.value)
    expect(result.ok).toBe(true)
    expect(result.value.nextRuns).toHaveLength(5)
  })

  it('給得出中文說明', () => {
    expect(describe('0 9 * * *').value.description).toBeTruthy()
  })

  it('亂寫的表達式會回報錯誤', () => {
    expect(describe('這不是 cron').ok).toBe(false)
  })

  it('錯誤訊息不會出現 undefined', () => {
    // cronstrue 丟的是字串不是 Error，讀 e.message 會拿到 undefined
    for (const bad of ['這不是 cron', '* * *', '0 99 * * *']) {
      const result = describe(bad)
      expect(result.ok, bad).toBe(false)
      expect(result.error, bad).not.toContain('undefined')
    }
  })

  it('錯誤訊息會去掉多餘的 Error 前綴', () => {
    expect(describe('0 99 * * *').error).not.toContain('Error:')
  })

  it('空字串回傳空結果', () => {
    expect(describe('')).toEqual({ ok: true, value: null })
  })
})

group('PRESETS', () => {
  it('每個預設值都解析得過', () => {
    for (const preset of PRESETS) {
      expect(describe(preset.expression).ok, preset.label).toBe(true)
    }
  })
})
