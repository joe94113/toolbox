function cellToText(value) {
  if (value === undefined) return ''
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * 把一個 JSON 陣列排成表格。
 * 陣列裡是物件：欄位是所有物件 key 的聯集（依第一次出現的順序）。
 * 陣列裡是純數字/字串：排成單欄表格。
 */
export function jsonToTable(text) {
  if (!text.trim()) return { ok: true, value: null }

  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    return { ok: false, error: `這不是合法的 JSON：${e.message}` }
  }

  if (!Array.isArray(data)) {
    return { ok: false, error: '這個工具只能處理 JSON 陣列，最外層要是 [ ... ]' }
  }
  if (data.length === 0) {
    return { ok: true, value: { headers: [], rows: [] } }
  }

  const isObjectArray = data.every((item) => item && typeof item === 'object' && !Array.isArray(item))

  if (!isObjectArray) {
    return {
      ok: true,
      value: {
        headers: ['值'],
        rows: data.map((item) => [cellToText(item)]),
      },
    }
  }

  const headers = []
  for (const item of data) {
    for (const key of Object.keys(item)) {
      if (!headers.includes(key)) headers.push(key)
    }
  }

  const rows = data.map((item) => headers.map((h) => cellToText(item[h])))

  return { ok: true, value: { headers, rows } }
}
