import { describe, it, expect } from 'vitest'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, parseColor } from './logic.js'

describe('hexToRgb / rgbToHex', () => {
  it('解析 6 碼 HEX', () => {
    expect(hexToRgb('#3366FF')).toEqual({ r: 51, g: 102, b: 255 })
  })
  it('解析 3 碼縮寫 HEX', () => {
    expect(hexToRgb('#36F')).toEqual({ r: 51, g: 102, b: 255 })
  })
  it('RGB 轉回 HEX 是大寫且補零', () => {
    expect(rgbToHex({ r: 51, g: 102, b: 255 })).toBe('#3366FF')
  })
  it('不合法的 HEX 回傳 null', () => {
    expect(hexToRgb('#zzz')).toBe(null)
  })
})

describe('rgbToHsl / hslToRgb 互轉', () => {
  it('純紅色轉成 HSL', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
  })
  it('HSL 轉回 RGB 誤差在 1 以內', () => {
    const rgb = hslToRgb({ h: 210, s: 100, l: 60 })
    expect(rgb.r).toBeCloseTo(51, -1)
    expect(rgb.b).toBeCloseTo(255, -1)
  })
})

describe('parseColor', () => {
  it('接受 HEX 格式並同時算出 rgb/hsl', () => {
    const result = parseColor('#3366ff')
    expect(result.ok).toBe(true)
    expect(result.value.hex).toBe('#3366FF')
    expect(result.value.rgb).toBe('rgb(51, 102, 255)')
  })
  it('接受 rgb() 格式', () => {
    const result = parseColor('rgb(51, 102, 255)')
    expect(result.ok).toBe(true)
    expect(result.value.hex).toBe('#3366FF')
  })
  it('接受 hsl() 格式', () => {
    const result = parseColor('hsl(220, 100%, 60%)')
    expect(result.ok).toBe(true)
    expect(result.value.hex).toBeTruthy()
  })
  it('看不懂的格式回傳好懂的錯誤訊息', () => {
    const result = parseColor('not-a-color')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('看不懂這個顏色格式')
  })
  it('空字串視為空輸出，不是錯誤', () => {
    expect(parseColor('')).toEqual({ ok: true, value: null })
  })
})
