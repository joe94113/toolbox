import { describe, it, expect } from 'vitest'
import {
  byteLength,
  validateContent,
  buildWifiPayload,
  buildMailtoPayload,
} from './logic.js'

describe('byteLength', () => {
  it('英文一個字元一個位元組', () => {
    expect(byteLength('hello')).toBe(5)
  })

  it('中文一個字三個位元組', () => {
    expect(byteLength('你好')).toBe(6)
  })

  it('emoji 算四個位元組', () => {
    expect(byteLength('🎉')).toBe(4)
  })
})

describe('validateContent', () => {
  it('一般內容可以通過', () => {
    expect(validateContent('https://example.com').value).toMatchObject({ bytes: 19 })
  })

  it('超過容錯等級上限會擋下來', () => {
    expect(validateContent('a'.repeat(3000), 'L').ok).toBe(false)
  })

  it('高容錯等級的上限比較低', () => {
    const text = 'a'.repeat(1500)
    expect(validateContent(text, 'L').ok).toBe(true)
    expect(validateContent(text, 'H').ok).toBe(false)
  })

  it('用位元組而不是字數判斷長度', () => {
    // 500 個中文 = 1500 位元組，超過 H 的 1273
    expect(validateContent('中'.repeat(500), 'H').ok).toBe(false)
  })

  it('空字串回傳空結果', () => {
    expect(validateContent('')).toEqual({ ok: true, value: null })
  })
})

describe('buildWifiPayload', () => {
  it('組出標準的 Wi-Fi QR 格式', () => {
    expect(buildWifiPayload({ ssid: 'MyNet', password: 'pw123' }).value).toBe(
      'WIFI:T:WPA;S:MyNet;P:pw123;;'
    )
  })

  it('跳脫有特殊意義的字元', () => {
    expect(buildWifiPayload({ ssid: 'Cafe;Free', password: 'a:b' }).value).toBe(
      'WIFI:T:WPA;S:Cafe\\;Free;P:a\\:b;;'
    )
  })

  it('無密碼網路不帶密碼欄位', () => {
    expect(buildWifiPayload({ ssid: 'Open', encryption: 'nopass' }).value).toBe(
      'WIFI:T:nopass;S:Open;;'
    )
  })

  it('隱藏網路會加上 H:true', () => {
    expect(buildWifiPayload({ ssid: 'Hidden', password: 'x', hidden: true }).value).toContain(
      'H:true'
    )
  })

  it('沒填 SSID 會回報錯誤', () => {
    expect(buildWifiPayload({ ssid: '' }).ok).toBe(false)
  })
})

describe('buildMailtoPayload', () => {
  it('只有收件人時不加問號', () => {
    expect(buildMailtoPayload({ to: 'a@b.com' }).value).toBe('mailto:a@b.com')
  })

  it('帶主旨與內文', () => {
    expect(buildMailtoPayload({ to: 'a@b.com', subject: 'Hi there' }).value).toBe(
      'mailto:a@b.com?subject=Hi+there'
    )
  })

  it('沒填收件人會回報錯誤', () => {
    expect(buildMailtoPayload({ to: '' }).ok).toBe(false)
  })
})
