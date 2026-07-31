function clamp255(n) {
  return Math.min(255, Math.max(0, Math.round(n)))
}

export function hexToRgb(hex) {
  const clean = hex.trim().replace(/^#/, '')
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) => clamp255(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }) {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return {
    r: clamp255((r + m) * 255),
    g: clamp255((g + m) * 255),
    b: clamp255((b + m) * 255),
  }
}

/**
 * 解析 HEX / rgb() / hsl() 任一格式的顏色字串，
 * 回傳三種格式都算好的結果，方便畫面同時顯示。
 */
export function parseColor(input) {
  const text = input.trim()
  if (!text) return { ok: true, value: null }

  let rgb = null

  if (text.startsWith('#') || /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(text)) {
    rgb = hexToRgb(text)
  } else {
    const rgbMatch = text.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
    const hslMatch = text.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?/i)
    if (rgbMatch) {
      rgb = { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] }
    } else if (hslMatch) {
      rgb = hslToRgb({ h: +hslMatch[1], s: +hslMatch[2], l: +hslMatch[3] })
    }
  }

  if (!rgb) {
    return {
      ok: false,
      error: '看不懂這個顏色格式，試試看 #3366ff、rgb(51,102,255) 或 hsl(220,100%,60%)',
    }
  }

  return {
    ok: true,
    value: {
      hex: rgbToHex(rgb),
      rgb: `rgb(${clamp255(rgb.r)}, ${clamp255(rgb.g)}, ${clamp255(rgb.b)})`,
      hsl: (() => {
        const h = rgbToHsl(rgb)
        return `hsl(${h.h}, ${h.s}%, ${h.l}%)`
      })(),
      swatch: rgbToHex(rgb),
    },
  }
}
