/**
 * Cron 產生器的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 跟 cron-parser-tool 是一對：那個把表達式翻成人話，
 * 這個反過來讓人用選的組出表達式。驗證與說明沿用同兩個套件。
 */
import { CronExpressionParser } from 'cron-parser'
import cronstrue from 'cronstrue'
import 'cronstrue/locales/zh_TW'

export const PRESETS = [
  { label: '每分鐘', expression: '* * * * *' },
  { label: '每 5 分鐘', expression: '*/5 * * * *' },
  { label: '每小時整點', expression: '0 * * * *' },
  { label: '每天午夜', expression: '0 0 * * *' },
  { label: '每天早上 9 點', expression: '0 9 * * *' },
  { label: '每週一早上 9 點', expression: '0 9 * * 1' },
  { label: '每月 1 號午夜', expression: '0 0 1 * *' },
  { label: '每個工作日早上 9 點', expression: '0 9 * * 1-5' },
]

export const WEEKDAY_OPTIONS = [
  { value: 0, label: '日' },
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
]

/**
 * 把一組選出來的數字壓成 cron 欄位。
 * 全選等於不限制，直接寫 * 比列出 0,1,2,...,59 好讀太多。
 */
export function compactField(values, totalCount) {
  if (!values || values.length === 0) return '*'
  if (values.length >= totalCount) return '*'
  return [...new Set(values)].sort((a, b) => a - b).join(',')
}

/** 依頻率組出五個欄位 */
export function buildExpression(config) {
  const {
    frequency = 'daily',
    minute = 0,
    hour = 0,
    interval = 5,
    weekdays = [],
    dayOfMonth = 1,
  } = config

  switch (frequency) {
    case 'everyMinute':
      return { ok: true, value: '* * * * *' }

    case 'everyNMinutes': {
      const n = Number(interval)
      if (!Number.isInteger(n) || n < 1 || n > 59) {
        return { ok: false, error: '間隔請填 1 到 59 之間的整數分鐘' }
      }
      return { ok: true, value: `*/${n} * * * *` }
    }

    case 'hourly':
      return { ok: true, value: `${minute} * * * *` }

    case 'daily':
      return { ok: true, value: `${minute} ${hour} * * *` }

    case 'weekly': {
      if (!weekdays.length) {
        return { ok: false, error: '請至少選一個星期幾' }
      }
      return {
        ok: true,
        value: `${minute} ${hour} * * ${compactField(weekdays, 7)}`,
      }
    }

    case 'monthly': {
      const d = Number(dayOfMonth)
      if (!Number.isInteger(d) || d < 1 || d > 31) {
        return { ok: false, error: '日期請填 1 到 31' }
      }
      return { ok: true, value: `${minute} ${hour} ${d} * *` }
    }

    default:
      return { ok: false, error: '不認得這個頻率' }
  }
}

/**
 * cronstrue 丟出來的是「字串」而不是 Error 物件，
 * 直接讀 e.message 會得到 undefined，畫面上就變成「看不懂：undefined」。
 * cron-parser 丟的則是正常的 Error，所以兩種都要處理。
 */
export function errorMessage(e) {
  const text = typeof e === 'string' ? e : e?.message || String(e)
  return text.replace(/^Error:\s*/, '')
}

/** 驗證表達式並附上中文說明與接下來幾次執行時間 */
export function describe(expression, count = 5) {
  const trimmed = String(expression ?? '').trim()
  if (!trimmed) return { ok: true, value: null }

  let description
  try {
    description = cronstrue.toString(trimmed, { locale: 'zh_TW' })
  } catch (e) {
    return { ok: false, error: `這個 cron 表達式看不懂：${errorMessage(e)}` }
  }

  try {
    const interval = CronExpressionParser.parse(trimmed)
    const nextRuns = []
    for (let i = 0; i < count; i++) {
      nextRuns.push(interval.next().toDate().toLocaleString('zh-TW', { hour12: false }))
    }
    return { ok: true, value: { expression: trimmed, description, nextRuns } }
  } catch (e) {
    return { ok: false, error: `算不出下次執行時間：${errorMessage(e)}` }
  }
}
