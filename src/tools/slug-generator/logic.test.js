import { describe, it, expect } from 'vitest'
import { toSlug } from './logic.js'

describe('toSlug', () => {
  it('英文標題轉成小寫連字號格式', () => {
    expect(toSlug('Hello World Wide Web')).toEqual({ ok: true, value: 'hello-world-wide-web' })
  })

  it('保留中文字元', () => {
    expect(toSlug('你好 世界')).toEqual({ ok: true, value: '你好-世界' })
  })

  it('去除重音符號', () => {
    expect(toSlug('Café Résumé')).toEqual({ ok: true, value: 'cafe-resume' })
  })

  it('標點符號換成連字號並收斂連續符號', () => {
    expect(toSlug('Vue.js: 快速上手!!')).toEqual({ ok: true, value: 'vue-js-快速上手' })
  })

  it('去除頭尾多餘的連字號', () => {
    expect(toSlug('  -- Hello --  ')).toEqual({ ok: true, value: 'hello' })
  })

  it('空字串回傳空結果', () => {
    expect(toSlug('')).toEqual({ ok: true, value: '' })
  })
})
