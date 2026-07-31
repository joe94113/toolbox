import { describe, it, expect } from 'vitest'
import { generateUuids, inspectUuid } from './logic.js'

// 固定的假產生器，讓輸出可預測
const fake = () => '3F2504E0-4F89-41D3-9A0C-0305E82C3301'

describe('generateUuids', () => {
  it('預設產生一個小寫、帶連字號的 UUID', () => {
    expect(generateUuids(1, { makeUuid: fake })).toEqual({
      ok: true,
      value: ['3f2504e0-4f89-41d3-9a0c-0305e82c3301'],
    })
  })

  it('可以一次產生多個', () => {
    const result = generateUuids(3, { makeUuid: fake })
    expect(result.ok).toBe(true)
    expect(result.value).toHaveLength(3)
  })

  it('可以轉成大寫', () => {
    expect(generateUuids(1, { makeUuid: fake, uppercase: true }).value[0]).toBe(
      '3F2504E0-4F89-41D3-9A0C-0305E82C3301'
    )
  })

  it('可以拿掉連字號', () => {
    expect(generateUuids(1, { makeUuid: fake, hyphens: false }).value[0]).toBe(
      '3f2504e04f8941d39a0c0305e82c3301'
    )
  })

  it('數量小於 1 會擋下來', () => {
    expect(generateUuids(0, { makeUuid: fake }).ok).toBe(false)
  })

  it('數量太多會擋下來', () => {
    expect(generateUuids(101, { makeUuid: fake }).ok).toBe(false)
  })

  it('真的產生時每次都不一樣', () => {
    const result = generateUuids(5)
    expect(new Set(result.value).size).toBe(5)
  })
})

describe('inspectUuid', () => {
  it('讀得出版本號', () => {
    expect(inspectUuid('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toEqual({
      ok: true,
      value: { normalized: '3f2504e0-4f89-41d3-9a0c-0305e82c3301', version: 4 },
    })
  })

  it('沒有連字號的寫法也讀得懂', () => {
    expect(inspectUuid('3f2504e04f8941d39a0c0305e82c3301').value.normalized).toBe(
      '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
    )
  })

  it('帶大括號的寫法也讀得懂', () => {
    expect(inspectUuid('{3f2504e0-4f89-41d3-9a0c-0305e82c3301}').ok).toBe(true)
  })

  it('格式不對會回報錯誤', () => {
    expect(inspectUuid('not-a-uuid').ok).toBe(false)
  })

  it('空字串回傳空結果', () => {
    expect(inspectUuid('')).toEqual({ ok: true, value: null })
  })
})
