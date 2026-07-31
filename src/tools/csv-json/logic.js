/**
 * CSV ↔ JSON 互轉的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 用 papaparse（專案已經有了，csv-to-table 也在用），
 * 引號、跳脫、換行藏在欄位裡這些邊界情況它處理得比手寫的 split 好太多。
 */
import Papa from 'papaparse'

export function csvToJson(text, options = {}) {
  const { header = true, dynamicTyping = true, indent = 2 } = options
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: '' }

  const parsed = Papa.parse(raw.trim(), {
    header,
    dynamicTyping,
    skipEmptyLines: true,
  })

  // papaparse 對小問題只會警告但照樣給資料，只有引號沒收尾這種
  // 真的解析不出東西的才算失敗。
  // 特別注意 UndetectableDelimiter：單欄 CSV 一定會觸發它，
  // 但那是完全正常的輸入，不能當成錯誤擋掉。
  const fatal = parsed.errors.find((e) => e.type === 'Quotes')
  if (fatal) {
    const where = Number.isInteger(fatal.row) ? `第 ${fatal.row + 1} 列` : '某一列'
    return { ok: false, error: `CSV 解析失敗（${where}）：引號沒有正確收尾` }
  }

  return { ok: true, value: JSON.stringify(parsed.data, null, indent) }
}

export function jsonToCsv(text, options = {}) {
  const { delimiter = ',' } = options
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: '' }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    return { ok: false, error: `這段內容不是合法的 JSON：${e.message}` }
  }

  if (!Array.isArray(data)) {
    return { ok: false, error: 'CSV 是一列一筆資料，所以請給一個陣列（最外層是 [ ]）' }
  }
  if (data.length === 0) {
    return { ok: true, value: '' }
  }
  if (data.some((row) => row === null || typeof row !== 'object' || Array.isArray(row))) {
    return { ok: false, error: '陣列裡每一筆都要是物件，才對得出欄位名稱' }
  }

  try {
    return { ok: true, value: Papa.unparse(data, { delimiter }) }
  } catch (e) {
    return { ok: false, error: `轉成 CSV 時出錯：${e.message}` }
  }
}
