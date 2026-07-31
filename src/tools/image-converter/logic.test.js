import { describe, it, expect } from 'vitest'
import {
  findFormat,
  formatBytes,
  calculateDimensions,
  clampQuality,
  outputFilename,
  savingPercent,
} from './logic.js'

describe('formatBytes', () => {
  it('小於 1KB 用 B', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('KB 與 MB 各自進位', () => {
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB')
  })

  it('讀不出來時給破折號', () => {
    expect(formatBytes(NaN)).toBe('—')
    expect(formatBytes(-1)).toBe('—')
  })
})

describe('calculateDimensions', () => {
  it('比上限大時等比例縮小', () => {
    expect(calculateDimensions(2000, 1000, 1000, 1000).value).toEqual({
      width: 1000,
      height: 500,
      scaled: true,
    })
  })

  it('高度才是瓶頸時也算得對', () => {
    expect(calculateDimensions(1000, 2000, 1000, 1000).value).toEqual({
      width: 500,
      height: 1000,
      scaled: true,
    })
  })

  it('比上限小時不放大', () => {
    expect(calculateDimensions(300, 200, 1000, 1000).value).toEqual({
      width: 300,
      height: 200,
      scaled: false,
    })
  })

  it('沒設上限就原樣', () => {
    expect(calculateDimensions(4000, 3000, 0, 0).value).toMatchObject({
      width: 4000,
      height: 3000,
    })
  })

  it('縮放後至少留 1px，不會變成 0', () => {
    expect(calculateDimensions(1000, 1, 10, 10).value.height).toBe(1)
  })

  it('尺寸不合法會回報錯誤', () => {
    expect(calculateDimensions(0, 100, 50, 50).ok).toBe(false)
  })
})

describe('clampQuality', () => {
  it('有損格式限制在 0.1~1', () => {
    expect(clampQuality(2, 'image/jpeg')).toBe(1)
    expect(clampQuality(0, 'image/jpeg')).toBe(0.1)
    expect(clampQuality(0.6, 'image/jpeg')).toBe(0.6)
  })

  it('PNG 是無損，不吃品質參數', () => {
    expect(clampQuality(0.5, 'image/png')).toBeUndefined()
  })
})

describe('outputFilename', () => {
  it('換掉副檔名保留檔名', () => {
    expect(outputFilename('photo.png', 'image/webp')).toBe('photo.webp')
  })

  it('檔名有多個點只換最後一段', () => {
    expect(outputFilename('my.holiday.photo.jpeg', 'image/png')).toBe('my.holiday.photo.png')
  })

  it('沒有檔名時給預設值', () => {
    expect(outputFilename('', 'image/jpeg')).toBe('image.jpg')
  })
})

describe('savingPercent', () => {
  it('算得出省下的百分比', () => {
    expect(savingPercent(1000, 250)).toBe(75)
  })

  it('變大時回傳負數', () => {
    expect(savingPercent(100, 150)).toBe(-50)
  })

  it('原始大小不合法時回傳 null', () => {
    expect(savingPercent(0, 100)).toBeNull()
  })
})

describe('findFormat', () => {
  it('找得到支援的格式', () => {
    expect(findFormat('image/webp')).toMatchObject({ ext: 'webp', lossy: true })
  })

  it('不支援的格式回傳 null', () => {
    expect(findFormat('image/gif')).toBeNull()
  })
})
