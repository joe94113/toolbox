// 每個分類底下是「換算成基準單位要乘的倍率」，基準單位倍率是 1。
export const CATEGORIES = {
  length: {
    label: '長度',
    base: 'm',
    units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344 },
  },
  weight: {
    label: '重量',
    base: 'kg',
    units: { mg: 0.000001, g: 0.001, kg: 1, ton: 1000, oz: 0.0283495, lb: 0.453592 },
  },
  volume: {
    label: '體積',
    base: 'l',
    units: { ml: 0.001, l: 1, m3: 1000, gallon: 3.78541, cup: 0.24 },
  },
  temperature: {
    label: '溫度',
    base: 'celsius',
    units: { celsius: null, fahrenheit: null, kelvin: null }, // 溫度不是線性倍率，另外處理
  },
}

function convertTemperature(value, from, to) {
  // 先統一換成攝氏，再從攝氏換成目標單位
  let celsius
  if (from === 'celsius') celsius = value
  else if (from === 'fahrenheit') celsius = ((value - 32) * 5) / 9
  else celsius = value - 273.15 // kelvin

  if (to === 'celsius') return celsius
  if (to === 'fahrenheit') return (celsius * 9) / 5 + 32
  return celsius + 273.15 // kelvin
}

/**
 * 把 value 從 fromUnit 換算成 toUnit。
 */
export function convertUnit(category, value, fromUnit, toUnit) {
  const config = CATEGORIES[category]
  if (!config) return { ok: false, error: `沒有這個分類：${category}` }

  if (!Number.isFinite(value)) {
    return { ok: false, error: '請輸入一個數字' }
  }

  if (category === 'temperature') {
    return { ok: true, value: convertTemperature(value, fromUnit, toUnit) }
  }

  const fromFactor = config.units[fromUnit]
  const toFactor = config.units[toUnit]
  if (fromFactor === undefined || toFactor === undefined) {
    return { ok: false, error: '不認得這個單位' }
  }

  const base = value * fromFactor
  return { ok: true, value: base / toFactor }
}
