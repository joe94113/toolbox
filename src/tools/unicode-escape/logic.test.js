import { describe, it, expect } from 'vitest'
import { escapeText, unescapeText, inspect } from './logic.js'

describe('escapeText', () => {
  it('中文轉成 \\uXXXX', () => {
    expect(escapeText('你好').value).toBe('\\u4F60\\u597D')
  })

  it('預設保留 ASCII 不動', () => {
    expect(escapeText('ab你').value).toBe('ab\\u4F60')
  })

  it('可以連 ASCII 一起轉', () => {
    expect(escapeText('a', 'js', { asciiOnly: false }).value).toBe('\\u0061')
  })

  it('emoji 會拆成代理對，符合 \\uXXXX 只有 16 位元的限制', () => {
    expect(escapeText('🎉').value).toBe('\\uD83C\\uDF89')
  })

  it('大括號寫法直接給字碼點，不用拆代理對', () => {
    expect(escapeText('🎉', 'jsCodePoint').value).toBe('\\u{1F389}')
  })

  it('CSS 格式帶結尾空白', () => {
    expect(escapeText('你', 'css').value).toBe('\\4F60 ')
  })

  it('HTML 格式用 &#x…;', () => {
    expect(escapeText('你', 'html').value).toBe('&#x4F60;')
  })

  it('空字串回傳空結果', () => {
    expect(escapeText('')).toEqual({ ok: true, value: '' })
  })
})

describe('unescapeText', () => {
  it('解得開 \\uXXXX', () => {
    expect(unescapeText('\\u4F60\\u597D').value).toBe('你好')
  })

  it('解得開大括號寫法', () => {
    expect(unescapeText('\\u{1F389}').value).toBe('🎉')
  })

  it('解得開 \\xXX', () => {
    expect(unescapeText('\\x41').value).toBe('A')
  })

  it('解得開 HTML 十六進位與十進位實體', () => {
    expect(unescapeText('&#x4F60;&#22909;').value).toBe('你好')
  })

  it('超出 Unicode 範圍的原樣留著', () => {
    expect(unescapeText('&#99999999;').value).toBe('&#99999999;')
  })

  it('沒有跳脫序列的文字原樣輸出', () => {
    expect(unescapeText('hello 你好').value).toBe('hello 你好')
  })

  it('空字串回傳空結果', () => {
    expect(unescapeText('')).toEqual({ ok: true, value: '' })
  })
})

describe('來回轉換', () => {
  it('中文跳脫再還原會一致', () => {
    const original = '你好，世界'
    expect(unescapeText(escapeText(original).value).value).toBe(original)
  })

  it('emoji 跳脫再還原會一致', () => {
    expect(unescapeText(escapeText('🎉🚀').value).value).toBe('🎉🚀')
  })

  it('大括號格式來回也一致', () => {
    expect(unescapeText(escapeText('🎉', 'jsCodePoint').value).value).toBe('🎉')
  })
})

describe('inspect', () => {
  it('列出每個字元的字碼點', () => {
    expect(inspect('A你').value).toEqual([
      { char: 'A', hex: 'U+0041', decimal: 65 },
      { char: '你', hex: 'U+4F60', decimal: 20320 },
    ])
  })

  it('emoji 算一個字元不是兩個', () => {
    expect(inspect('🎉').value).toHaveLength(1)
  })

  it('空字串回傳空結果', () => {
    expect(inspect('')).toEqual({ ok: true, value: null })
  })
})
