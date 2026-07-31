import { describe, it, expect } from 'vitest'
import { encodeEntities, decodeEntities } from './logic.js'

describe('encodeEntities', () => {
  it('編碼五個必要字元', () => {
    expect(encodeEntities(`<a href="x">'&'</a>`).value).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;'
    )
  })

  it('預設保留中文不動', () => {
    expect(encodeEntities('你好 <b>').value).toBe('你好 &lt;b&gt;')
  })

  it('開啟選項後才把非 ASCII 也編碼', () => {
    expect(encodeEntities('你好', { encodeNonAscii: true }).value).toBe('&#20320;&#22909;')
  })

  it('emoji 不會被拆成兩半', () => {
    expect(encodeEntities('🎉', { encodeNonAscii: true }).value).toBe('&#127881;')
  })

  it('空字串回傳空結果', () => {
    expect(encodeEntities('')).toEqual({ ok: true, value: '' })
  })
})

describe('decodeEntities', () => {
  it('解得開具名實體', () => {
    expect(decodeEntities('&lt;p&gt;&amp;&lt;/p&gt;').value).toBe('<p>&</p>')
  })

  it('解得開十進位數字實體', () => {
    expect(decodeEntities('&#20320;&#22909;').value).toBe('你好')
  })

  it('解得開十六進位數字實體', () => {
    expect(decodeEntities('&#x4F60;&#x597D;').value).toBe('你好')
  })

  it('解得開常見的排版符號', () => {
    expect(decodeEntities('a&nbsp;b&mdash;c&hellip;').value).toBe('a b—c…')
  })

  it('不認識的實體原樣留著，不會吃掉', () => {
    expect(decodeEntities('&notreal; &amp;').value).toBe('&notreal; &')
  })

  it('超出 Unicode 範圍的數字實體原樣留著', () => {
    expect(decodeEntities('&#99999999;').value).toBe('&#99999999;')
  })

  it('編碼再解碼會回到原文', () => {
    const original = `<script>alert("hi & 'bye'")</script>`
    expect(decodeEntities(encodeEntities(original).value).value).toBe(original)
  })

  it('空字串回傳空結果', () => {
    expect(decodeEntities('')).toEqual({ ok: true, value: '' })
  })
})
