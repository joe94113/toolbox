import { describe, it, expect } from 'vitest'
import { generate, measure } from './logic.js'

// 固定的亂數來源，讓輸出可預測
const fixedRandom = () => 0.5

describe('generate', () => {
  it('產生指定數量的段落', () => {
    const result = generate({ unit: 'paragraphs', count: 3, random: fixedRandom })
    expect(result.ok).toBe(true)
    expect(result.value.split('\n\n')).toHaveLength(3)
  })

  it('產生指定數量的字', () => {
    const result = generate({ unit: 'words', count: 10, random: fixedRandom })
    expect(result.value.split(' ')).toHaveLength(10)
  })

  it('產生指定數量的句子', () => {
    const result = generate({ unit: 'sentences', count: 4, random: fixedRandom })
    expect(result.value.match(/\./g)).toHaveLength(4)
  })

  it('預設以 lorem ipsum 開頭', () => {
    expect(generate({ unit: 'paragraphs', count: 1, random: fixedRandom }).value).toMatch(
      /^Lorem ipsum dolor sit amet, /
    )
  })

  it('可以關掉 lorem 開頭', () => {
    expect(
      generate({ unit: 'paragraphs', count: 1, startWithLorem: false, random: fixedRandom }).value
    ).not.toMatch(/^Lorem ipsum dolor sit amet, /)
  })

  it('中文假文用全形句號且不加空白', () => {
    const result = generate({ unit: 'sentences', count: 2, language: 'cjk', random: fixedRandom })
    expect(result.value).toContain('。')
    expect(result.value).not.toContain(' ')
  })

  it('數量小於 1 會擋下來', () => {
    expect(generate({ count: 0 }).ok).toBe(false)
  })

  it('數量太多會擋下來', () => {
    expect(generate({ unit: 'paragraphs', count: 999 }).ok).toBe(false)
    expect(generate({ unit: 'words', count: 99999 }).ok).toBe(false)
  })

  it('不認得的單位會回報錯誤', () => {
    expect(generate({ unit: '亂填', count: 1 }).ok).toBe(false)
  })

  it('沒給固定亂數時每次結果不同', () => {
    const a = generate({ unit: 'words', count: 30, startWithLorem: false }).value
    const b = generate({ unit: 'words', count: 30, startWithLorem: false }).value
    expect(a).not.toBe(b)
  })
})

describe('measure', () => {
  it('算得出英文字數', () => {
    expect(measure('hello world').words).toBe(2)
  })

  it('中文一個字算一個字', () => {
    expect(measure('你好世界').words).toBe(4)
  })

  it('算得出段落數', () => {
    expect(measure('a\n\nb\n\nc').paragraphs).toBe(3)
  })

  it('空字串時段落數是 0', () => {
    expect(measure('').paragraphs).toBe(0)
  })
})
