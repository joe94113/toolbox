/**
 * SQL 格式整理的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 用 sql-formatter 套件而不是自己寫：SQL 的方言差異、字串與註解裡的
 * 關鍵字、巢狀子查詢，自己用正則處理很容易把別人的查詢改壞。
 */
import { format } from 'sql-formatter'

export const DIALECTS = [
  { value: 'sql', label: '標準 SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'bigquery', label: 'BigQuery' },
]

export const KEYWORD_CASES = [
  { value: 'upper', label: '關鍵字大寫' },
  { value: 'lower', label: '關鍵字小寫' },
  { value: 'preserve', label: '維持原樣' },
]

export function formatSql(text, options = {}) {
  const { dialect = 'sql', keywordCase = 'upper', indent = 2 } = options
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: '' }

  try {
    return {
      ok: true,
      value: format(raw, {
        language: dialect,
        keywordCase,
        tabWidth: indent,
      }),
    }
  } catch (e) {
    return { ok: false, error: `這段 SQL 排不出來：${e.message}` }
  }
}

/** 壓成一行，貼進程式碼或日誌時用 */
export function minifySql(text) {
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: '' }

  // 先把 -- 開頭的單行註解整行拿掉，否則壓成一行後
  // 註解會把後面的 SQL 全部吃掉變成無效查詢
  const withoutLineComments = raw.replace(/--[^\n]*/g, '')
  const withoutBlockComments = withoutLineComments.replace(/\/\*[\s\S]*?\*\//g, ' ')

  return {
    ok: true,
    value: withoutBlockComments.replace(/\s+/g, ' ').trim(),
  }
}
