import { describe, it, expect } from 'vitest'
import { parseIp, formatIp, prefixToMask, parseCidr, contains, isPrivate } from './logic.js'

describe('parseIp / formatIp', () => {
  it('來回轉換一致', () => {
    expect(formatIp(parseIp('192.168.1.1'))).toBe('192.168.1.1')
  })

  it('處理得了高位位址，不會因為有號位移變成負數', () => {
    // 這是最容易踩到的地方：224.0.0.1 超過 2^31
    expect(formatIp(parseIp('224.0.0.1'))).toBe('224.0.0.1')
    expect(formatIp(parseIp('255.255.255.255'))).toBe('255.255.255.255')
  })

  it('欄位超過 255 視為無效', () => {
    expect(parseIp('256.0.0.1')).toBeNull()
  })

  it('欄位數不對視為無效', () => {
    expect(parseIp('192.168.1')).toBeNull()
    expect(parseIp('1.2.3.4.5')).toBeNull()
  })

  it('非數字視為無效', () => {
    expect(parseIp('a.b.c.d')).toBeNull()
  })
})

describe('prefixToMask', () => {
  it('常見前綴算得對', () => {
    expect(formatIp(prefixToMask(24))).toBe('255.255.255.0')
    expect(formatIp(prefixToMask(16))).toBe('255.255.0.0')
    expect(formatIp(prefixToMask(32))).toBe('255.255.255.255')
  })

  it('/0 是全零遮罩，不會因為位移 32 位而出錯', () => {
    expect(formatIp(prefixToMask(0))).toBe('0.0.0.0')
  })
})

describe('parseCidr', () => {
  it('算得出 /24 的各項數值', () => {
    expect(parseCidr('192.168.1.10/24').value).toMatchObject({
      network: '192.168.1.0',
      broadcast: '192.168.1.255',
      firstHost: '192.168.1.1',
      lastHost: '192.168.1.254',
      mask: '255.255.255.0',
      wildcard: '0.0.0.255',
      totalAddresses: 256,
      usableHosts: 254,
    })
  })

  it('沒寫前綴時預設 /24', () => {
    expect(parseCidr('10.0.0.1').value.prefix).toBe(24)
  })

  it('/32 是單一主機，可用數是 1', () => {
    expect(parseCidr('8.8.8.8/32').value).toMatchObject({
      totalAddresses: 1,
      usableHosts: 1,
      firstHost: '8.8.8.8',
      lastHost: '8.8.8.8',
    })
  })

  it('/31 是點對點，兩個位址都能用', () => {
    expect(parseCidr('10.0.0.0/31').value).toMatchObject({
      totalAddresses: 2,
      usableHosts: 2,
    })
  })

  it('/0 涵蓋整個 IPv4 空間', () => {
    expect(parseCidr('0.0.0.0/0').value.totalAddresses).toBe(4294967296)
  })

  it('大網段的廣播位址算得對', () => {
    expect(parseCidr('172.16.5.1/12').value).toMatchObject({
      network: '172.16.0.0',
      broadcast: '172.31.255.255',
    })
  })

  it('IP 格式錯誤會回報', () => {
    expect(parseCidr('999.1.1.1/24').ok).toBe(false)
  })

  it('前綴超過 32 會回報', () => {
    expect(parseCidr('10.0.0.1/33').ok).toBe(false)
  })

  it('空字串回傳空結果', () => {
    expect(parseCidr('')).toEqual({ ok: true, value: null })
  })
})

describe('isPrivate', () => {
  it('認得三段私有位址', () => {
    expect(isPrivate(parseIp('10.1.2.3'))).toBe(true)
    expect(isPrivate(parseIp('172.16.0.1'))).toBe(true)
    expect(isPrivate(parseIp('192.168.1.1'))).toBe(true)
  })

  it('認得 loopback 與 link-local', () => {
    expect(isPrivate(parseIp('127.0.0.1'))).toBe(true)
    expect(isPrivate(parseIp('169.254.1.1'))).toBe(true)
  })

  it('公開位址不算私有', () => {
    expect(isPrivate(parseIp('8.8.8.8'))).toBe(false)
    expect(isPrivate(parseIp('172.32.0.1'))).toBe(false)
  })
})

describe('contains', () => {
  it('網段內的 IP 回傳 true', () => {
    expect(contains('192.168.1.0/24', '192.168.1.99').value).toBe(true)
  })

  it('網段外的 IP 回傳 false', () => {
    expect(contains('192.168.1.0/24', '192.168.2.1').value).toBe(false)
  })

  it('格式錯誤會回報', () => {
    expect(contains('192.168.1.0/24', '亂打').ok).toBe(false)
  })
})
