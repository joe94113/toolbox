import { describe, it, expect } from 'vitest'
import { convertUnit } from './logic.js'

describe('convertUnit - 長度', () => {
  it('公里轉公尺', () => {
    expect(convertUnit('length', 1, 'km', 'm').value).toBe(1000)
  })
  it('英里轉公里約 1.609', () => {
    const result = convertUnit('length', 1, 'mile', 'km')
    expect(result.value).toBeCloseTo(1.609, 2)
  })
})

describe('convertUnit - 重量', () => {
  it('公斤轉磅約 2.2', () => {
    const result = convertUnit('weight', 1, 'kg', 'lb')
    expect(result.value).toBeCloseTo(2.2046, 3)
  })
})

describe('convertUnit - 溫度', () => {
  it('攝氏 0 度等於華氏 32 度', () => {
    expect(convertUnit('temperature', 0, 'celsius', 'fahrenheit').value).toBe(32)
  })
  it('攝氏 0 度等於 273.15 K', () => {
    expect(convertUnit('temperature', 0, 'celsius', 'kelvin').value).toBeCloseTo(273.15, 2)
  })
  it('華氏 212 度等於攝氏 100 度（水的沸點）', () => {
    expect(convertUnit('temperature', 212, 'fahrenheit', 'celsius').value).toBeCloseTo(100, 5)
  })
})

describe('convertUnit - 錯誤處理', () => {
  it('不是數字時回傳錯誤', () => {
    expect(convertUnit('length', NaN, 'km', 'm').ok).toBe(false)
  })
  it('不存在的分類回傳錯誤', () => {
    expect(convertUnit('nope', 1, 'a', 'b').ok).toBe(false)
  })
})
