/**
 * IPv4 子網路計算的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * IPv4 位址是 32 位元無號整數，但 JavaScript 的位元運算是「有號」的，
 * 超過 2^31 會變成負數。所以全部用 >>> 0 轉回無號，
 * 否則 128.0.0.0 以上的位址會全部算錯。
 */

export function parseIp(text) {
  const parts = String(text ?? '').trim().split('.')
  if (parts.length !== 4) return null

  const nums = []
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const n = Number(part)
    if (n > 255) return null
    nums.push(n)
  }
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0
}

export function formatIp(int) {
  const n = int >>> 0
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

/** 前綴長度轉成遮罩整數。/0 要特別處理，位移 32 位在 JS 會變成不位移 */
export function prefixToMask(prefix) {
  if (prefix === 0) return 0
  return (0xffffffff << (32 - prefix)) >>> 0
}

export function maskToPrefix(mask) {
  let count = 0
  let m = mask >>> 0
  while (m & 0x80000000) {
    count++
    m = (m << 1) >>> 0
  }
  return count
}

export function parseCidr(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return { ok: true, value: null }

  const [ipPart, prefixPart] = raw.split('/')
  const ip = parseIp(ipPart)
  if (ip === null) {
    return { ok: false, error: '看不懂這個 IP 位址，格式應該像 192.168.1.1' }
  }

  let prefix = 24
  if (prefixPart !== undefined) {
    if (!/^\d{1,2}$/.test(prefixPart.trim())) {
      return { ok: false, error: '前綴長度要是 0 到 32 的數字，像 /24' }
    }
    prefix = Number(prefixPart)
    if (prefix > 32) {
      return { ok: false, error: '前綴長度最多 32' }
    }
  }

  const mask = prefixToMask(prefix)
  const network = (ip & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = prefix === 32 ? 1 : 2 ** (32 - prefix)

  // /31 是點對點連線、/32 是單一主機，這兩種沒有網路位址與廣播位址的概念
  const hasHostRange = prefix <= 30
  const usable = hasHostRange ? total - 2 : total

  return {
    ok: true,
    value: {
      ip: formatIp(ip),
      prefix,
      mask: formatIp(mask),
      wildcard: formatIp(~mask >>> 0),
      network: formatIp(network),
      broadcast: formatIp(broadcast),
      firstHost: formatIp(hasHostRange ? network + 1 : network),
      lastHost: formatIp(hasHostRange ? broadcast - 1 : broadcast),
      totalAddresses: total,
      usableHosts: usable,
      isPrivate: isPrivate(ip),
      cidr: `${formatIp(network)}/${prefix}`,
    },
  }
}

const PRIVATE_RANGES = [
  ['10.0.0.0', 8],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
]

export function isPrivate(ip) {
  return PRIVATE_RANGES.some(([base, prefix]) => {
    const mask = prefixToMask(prefix)
    return ((ip & mask) >>> 0) === ((parseIp(base) & mask) >>> 0)
  })
}

/** 判斷某個 IP 在不在指定網段裡 */
export function contains(cidrText, ipText) {
  const parsed = parseCidr(cidrText)
  if (!parsed.ok || !parsed.value) return { ok: false, error: '網段格式不對' }

  const ip = parseIp(ipText)
  if (ip === null) return { ok: false, error: '要檢查的 IP 格式不對' }

  const mask = prefixToMask(parsed.value.prefix)
  const network = parseIp(parsed.value.network)
  return { ok: true, value: ((ip & mask) >>> 0) === network }
}
