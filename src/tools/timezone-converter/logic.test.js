import { describe, it, expect } from 'vitest'
import {
  wallTimeToInstant,
  parseLocalInput,
  formatInZone,
  convert,
  listTimezones,
} from './logic.js'

describe('parseLocalInput', () => {
  it('讀得懂 datetime-local 的格式', () => {
    expect(parseLocalInput('2024-03-15T14:30')).toEqual({
      year: 2024,
      month: 3,
      day: 15,
      hour: 14,
      minute: 30,
    })
  })

  it('空白分隔也讀得懂', () => {
    expect(parseLocalInput('2024-03-15 09:00').hour).toBe(9)
  })

  it('格式不對回傳 null', () => {
    expect(parseLocalInput('不是日期')).toBeNull()
  })
})

describe('wallTimeToInstant', () => {
  it('台北時間比 UTC 快 8 小時', () => {
    const instant = wallTimeToInstant(
      { year: 2024, month: 1, day: 1, hour: 12, minute: 0 },
      'Asia/Taipei'
    )
    expect(instant.toISOString()).toBe('2024-01-01T04:00:00.000Z')
  })

  it('UTC 的牆上時間就是 UTC 本身', () => {
    const instant = wallTimeToInstant(
      { year: 2024, month: 6, day: 1, hour: 0, minute: 0 },
      'UTC'
    )
    expect(instant.toISOString()).toBe('2024-06-01T00:00:00.000Z')
  })

  it('紐約冬令時間是 UTC-5', () => {
    const instant = wallTimeToInstant(
      { year: 2024, month: 1, day: 15, hour: 12, minute: 0 },
      'America/New_York'
    )
    expect(instant.toISOString()).toBe('2024-01-15T17:00:00.000Z')
  })

  it('紐約夏令時間是 UTC-4，日光節約有被算進去', () => {
    const instant = wallTimeToInstant(
      { year: 2024, month: 7, day: 15, hour: 12, minute: 0 },
      'America/New_York'
    )
    expect(instant.toISOString()).toBe('2024-07-15T16:00:00.000Z')
  })
})

describe('formatInZone', () => {
  it('算得出正的 UTC 偏移', () => {
    expect(formatInZone(new Date('2024-01-01T00:00:00Z'), 'Asia/Taipei').offset).toBe('UTC+08:00')
  })

  it('算得出負的 UTC 偏移', () => {
    expect(formatInZone(new Date('2024-01-01T00:00:00Z'), 'America/New_York').offset).toBe(
      'UTC-05:00'
    )
  })

  it('處理得了非整點時區', () => {
    expect(formatInZone(new Date('2024-01-01T00:00:00Z'), 'Asia/Kolkata').offset).toBe('UTC+05:30')
  })
})

describe('convert', () => {
  it('一次換算到多個時區', () => {
    const result = convert('2024-01-15T09:00', 'Asia/Taipei', ['UTC', 'America/New_York'])
    expect(result.ok).toBe(true)
    expect(result.value.iso).toBe('2024-01-15T01:00:00.000Z')
    expect(result.value.zones).toHaveLength(2)
  })

  it('同時給出 Unix 時間戳', () => {
    const result = convert('2024-01-01T08:00', 'Asia/Taipei', ['UTC'])
    expect(result.value.unix).toBe(1704067200)
  })

  it('沒填時間會回報錯誤', () => {
    expect(convert('', 'UTC', ['UTC']).ok).toBe(false)
  })
})

describe('listTimezones', () => {
  it('至少給得出一組時區', () => {
    const zones = listTimezones()
    expect(zones.length).toBeGreaterThan(0)
    expect(zones).toContain('Asia/Taipei')
  })
})
