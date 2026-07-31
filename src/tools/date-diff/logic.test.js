import { describe, it, expect } from 'vitest'
import { diffDates, shiftDate, weekdayOf, formatIso } from './logic.js'

describe('diffDates', () => {
  it('算得出相差天數', () => {
    expect(diffDates('2024-01-01', '2024-01-31').value.totalDays).toBe(30)
  })

  it('含結束日時多算一天', () => {
    expect(diffDates('2024-01-01', '2024-01-31', { includeEnd: true }).value.totalDays).toBe(31)
  })

  it('日期顛倒也算得出來，並標示方向', () => {
    const result = diffDates('2024-01-31', '2024-01-01').value
    expect(result.totalDays).toBe(30)
    expect(result.backwards).toBe(true)
  })

  it('跨閏年二月算得對', () => {
    // 2024 是閏年，2 月有 29 天
    expect(diffDates('2024-02-01', '2024-03-01').value.totalDays).toBe(29)
  })

  it('平年二月算得對', () => {
    expect(diffDates('2023-02-01', '2023-03-01').value.totalDays).toBe(28)
  })

  it('跨日光節約時間不會少算一天', () => {
    // 美國 2024 年 3 月 10 日進入夏令時間，那天只有 23 小時
    expect(diffDates('2024-03-09', '2024-03-11').value.totalDays).toBe(2)
  })

  it('拆得出年月日', () => {
    expect(diffDates('2020-01-15', '2024-03-20').value.breakdown).toEqual({
      years: 4,
      months: 2,
      days: 5,
    })
  })

  it('月底跨到下下個月：1/31 到 3/1 是 1 個月又 1 天', () => {
    // 借位寫法在這裡會算出負數天，因為二月不夠借
    expect(diffDates('2024-01-31', '2024-03-01').value.breakdown).toEqual({
      years: 0,
      months: 1,
      days: 1,
    })
  })

  it('月底加一個月會夾到該月最後一天', () => {
    // 1/31 加一個月是 2/29（閏年），所以到 2/29 剛好整整一個月
    expect(diffDates('2024-01-31', '2024-02-29').value.breakdown).toEqual({
      years: 0,
      months: 1,
      days: 0,
    })
  })

  it('拆解出來的天數不會是負的', () => {
    const cases = [
      ['2024-01-31', '2024-03-01'],
      ['2024-01-30', '2024-03-01'],
      ['2023-01-31', '2023-03-01'],
      ['2024-05-31', '2024-07-01'],
    ]
    for (const [from, to] of cases) {
      const { days, months } = diffDates(from, to).value.breakdown
      expect(days, `${from} → ${to}`).toBeGreaterThanOrEqual(0)
      expect(months, `${from} → ${to}`).toBeGreaterThanOrEqual(0)
    }
  })

  it('算得出週數與餘數', () => {
    const result = diffDates('2024-01-01', '2024-01-11').value
    expect(result.weeks).toBe(1)
    expect(result.remainderDays).toBe(3)
  })

  it('算得出工作日，排除週末', () => {
    // 2024-01-01 是週一，到 2024-01-08 週一，中間 5 個工作日
    expect(diffDates('2024-01-01', '2024-01-08').value.businessDays).toBe(5)
  })

  it('日期無效會回報錯誤', () => {
    expect(diffDates('2024-02-31', '2024-03-01').ok).toBe(false)
    expect(diffDates('', '2024-01-01').ok).toBe(false)
  })
})

describe('shiftDate', () => {
  it('往後推天數', () => {
    expect(shiftDate('2024-01-01', 30).value.iso).toBe('2024-01-31')
  })

  it('往前推用負數', () => {
    expect(shiftDate('2024-01-01', -1).value.iso).toBe('2023-12-31')
  })

  it('推週', () => {
    expect(shiftDate('2024-01-01', 2, 'weeks').value.iso).toBe('2024-01-15')
  })

  it('推月', () => {
    expect(shiftDate('2024-01-15', 2, 'months').value.iso).toBe('2024-03-15')
  })

  it('推年', () => {
    expect(shiftDate('2024-01-01', 1, 'years').value.iso).toBe('2025-01-01')
  })

  it('同時回傳星期幾', () => {
    expect(shiftDate('2024-01-01', 0).value.weekday).toBe('週一')
  })

  it('數字無效會回報錯誤', () => {
    expect(shiftDate('2024-01-01', 'abc').ok).toBe(false)
  })
})

describe('weekdayOf', () => {
  it('算得出星期幾', () => {
    expect(weekdayOf('2024-01-01')).toBe('週一')
    expect(weekdayOf('2024-01-06')).toBe('週六')
  })

  it('無效日期回傳 null', () => {
    expect(weekdayOf('亂打')).toBeNull()
  })
})

describe('formatIso', () => {
  it('補零成兩位數', () => {
    expect(formatIso(new Date(Date.UTC(2024, 0, 5, 12)))).toBe('2024-01-05')
  })
})
