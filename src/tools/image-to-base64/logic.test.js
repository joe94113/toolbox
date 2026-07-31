import { describe, it, expect } from 'vitest'
import {
  estimateEncodedSize,
  formatBytes,
  buildDataUri,
  parseDataUri,
  buildSnippets,
} from './logic.js'

describe('estimateEncodedSize', () => {
  it('大約放大三分之一', () => {
    expect(estimateEncodedSize(3000)).toBe(4000)
  })

  it('不足 3 的倍數會補到下一組', () => {
    expect(estimateEncodedSize(1)).toBe(4)
  })

  it('不合法輸入回傳 null', () => {
    expect(estimateEncodedSize(-5)).toBeNull()
  })
})

describe('formatBytes', () => {
  it('依大小換單位', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
})

describe('buildDataUri', () => {
  it('組出標準的 data URI', () => {
    expect(buildDataUri('image/png', 'AAAA')).toBe('data:image/png;base64,AAAA')
  })

  it('沒給型別時退回通用型別', () => {
    expect(buildDataUri('', 'AAAA')).toBe('data:application/octet-stream;base64,AAAA')
  })
})

describe('parseDataUri', () => {
  it('拆得出型別與內容', () => {
    const result = parseDataUri('data:image/png;base64,iVBORw0KGgo=')
    expect(result.value).toMatchObject({ mime: 'image/png', base64: 'iVBORw0KGgo=' })
  })

  it('算得出大約的原始大小', () => {
    // 8 個 base64 字元、1 個 padding → 6 - 1 = 5 bytes
    expect(parseDataUri('data:image/png;base64,AAAAAAA=').value.approxBytes).toBe(5)
  })

  it('不是 data URI 會回報錯誤', () => {
    expect(parseDataUri('https://example.com/a.png').ok).toBe(false)
  })

  it('非 base64 的 data URI 會說看不懂', () => {
    expect(parseDataUri('data:text/plain,hello').ok).toBe(false)
  })

  it('空字串回傳空結果', () => {
    expect(parseDataUri('')).toEqual({ ok: true, value: null })
  })

  it('組起來再拆回去會一致', () => {
    const uri = buildDataUri('image/webp', 'AAAA')
    expect(parseDataUri(uri).value).toMatchObject({ mime: 'image/webp', base64: 'AAAA' })
  })
})

describe('buildSnippets', () => {
  it('產生 HTML、CSS、Markdown 三種寫法', () => {
    const s = buildSnippets('data:image/png;base64,AAAA', '示意圖')
    expect(s.html).toBe('<img src="data:image/png;base64,AAAA" alt="示意圖" />')
    expect(s.css).toBe('background-image: url("data:image/png;base64,AAAA");')
    expect(s.markdown).toBe('![示意圖](data:image/png;base64,AAAA)')
  })
})
