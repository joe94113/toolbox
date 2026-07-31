import { describe, it, expect } from 'vitest'
import { parseNumber, formatBases, convert } from './logic.js'

describe('parseNumber', () => {
  it('沒有前綴時當作十進位', () => {
    expect(parseNumber('255')).toEqual({ ok: true, value: 255n })
  })

  it('認得 0x 十六進位前綴', () => {
    expect(parseNumber('0xFF')).toEqual({ ok: true, value: 255n })
  })

  it('認得 0b 二進位前綴', () => {
    expect(parseNumber('0b1111')).toEqual({ ok: true, value: 15n })
  })

  it('認得 0o 八進位前綴', () => {
    expect(parseNumber('0o777')).toEqual({ ok: true, value: 511n })
  })

  it('可以指定 base 而不用前綴', () => {
    expect(parseNumber('ff', 16)).toEqual({ ok: true, value: 255n })
  })

  it('忽略空白、底線與逗號', () => {
    expect(parseNumber('1_000_000')).toEqual({ ok: true, value: 1000000n })
  })

  it('處理負數', () => {
    expect(parseNumber('-42')).toEqual({ ok: true, value: -42n })
  })

  it('超過 2^53 也不會失真', () => {
    expect(parseNumber('9007199254740993')).toEqual({ ok: true, value: 9007199254740993n })
  })

  it('不合法的字元會回報錯誤', () => {
    expect(parseNumber('0b12').ok).toBe(false)
    expect(parseNumber('xyz', 10).ok).toBe(false)
  })

  it('只有前綴會回報錯誤', () => {
    expect(parseNumber('0x').ok).toBe(false)
  })

  it('空字串回傳空結果', () => {
    expect(parseNumber('')).toEqual({ ok: true, value: null })
  })
})

describe('formatBases', () => {
  it('轉出四種進位', () => {
    expect(formatBases(255n)).toEqual({
      bin: '11111111',
      oct: '377',
      dec: '255',
      hex: 'FF',
    })
  })

  it('負數每種進位都帶負號', () => {
    expect(formatBases(-10n)).toEqual({ bin: '-1010', oct: '-12', dec: '-10', hex: '-A' })
  })
})

describe('convert', () => {
  it('從十六進位一路轉到底', () => {
    expect(convert('0xFF').value).toMatchObject({ dec: '255', bin: '11111111' })
  })

  it('錯誤會原封不動傳出來', () => {
    expect(convert('0b12').ok).toBe(false)
  })
})
