import Papa from 'papaparse'

/**
 * 把 CSV 文字解析成表格資料。第一列當標題。
 */
export function parseCsv(text) {
  if (!text.trim()) return { ok: true, value: null }

  const parsed = Papa.parse(text.trim(), { skipEmptyLines: true })

  if (parsed.errors.length > 0) {
    return { ok: false, error: `第 ${parsed.errors[0].row + 1} 列格式怪怪的：${parsed.errors[0].message}` }
  }

  const [headers, ...rows] = parsed.data
  if (!headers) return { ok: true, value: null }

  return { ok: true, value: { headers, rows } }
}
