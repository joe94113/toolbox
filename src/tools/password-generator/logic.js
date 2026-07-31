const CHAR_SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}',
}

function randomInt(max) {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] % max
}

function strengthLabel(bits) {
  if (bits < 40) return '弱'
  if (bits < 64) return '普通'
  if (bits < 90) return '強'
  return '非常強'
}

/**
 * 用瀏覽器的加密等級亂數（crypto.getRandomValues）產生密碼，
 * 不是 Math.random，適合真的拿來當密碼用。
 */
export function generatePassword({ length = 16, lower = true, upper = true, numbers = true, symbols = false } = {}) {
  if (!Number.isInteger(length) || length < 4 || length > 128) {
    return { ok: false, error: '密碼長度請設在 4 到 128 之間' }
  }

  const pools = []
  if (lower) pools.push(CHAR_SETS.lower)
  if (upper) pools.push(CHAR_SETS.upper)
  if (numbers) pools.push(CHAR_SETS.numbers)
  if (symbols) pools.push(CHAR_SETS.symbols)

  if (pools.length === 0) {
    return { ok: false, error: '至少要選一種字元類型' }
  }

  const allChars = pools.join('')

  // 先從每個有勾選的類型各拿一個字元，確保每種類型都出現，
  // 再用其餘長度隨機補滿，最後洗牌打亂順序。
  const passwordChars = pools.map((pool) => pool[randomInt(pool.length)])
  for (let i = passwordChars.length; i < length; i++) {
    passwordChars.push(allChars[randomInt(allChars.length)])
  }
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]]
  }

  const bits = Math.round(length * Math.log2(allChars.length))

  return {
    ok: true,
    value: {
      password: passwordChars.join(''),
      bits,
      strength: strengthLabel(bits),
    },
  }
}
