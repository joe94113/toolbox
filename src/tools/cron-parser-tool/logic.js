import { CronExpressionParser } from 'cron-parser'
import cronstrue from 'cronstrue'
import 'cronstrue/locales/zh_TW'

/**
 * 解析 cron 表達式，回傳中文說明 + 接下來 5 次執行時間（本地時區）。
 */
export function parseCron(expression) {
  const trimmed = expression.trim()
  if (!trimmed) return { ok: true, value: null }

  let description
  try {
    description = cronstrue.toString(trimmed, { locale: 'zh_TW' })
  } catch (e) {
    return { ok: false, error: `看不懂這個 cron 表達式：${e.message}` }
  }

  try {
    const interval = CronExpressionParser.parse(trimmed)
    const nextRuns = []
    for (let i = 0; i < 5; i++) {
      nextRuns.push(interval.next().toDate())
    }
    return {
      ok: true,
      value: {
        description,
        nextRuns: nextRuns.map((d) => d.toLocaleString('zh-TW', { hour12: false })),
      },
    }
  } catch (e) {
    return { ok: false, error: `這個 cron 表達式算不出下次執行時間：${e.message}` }
  }
}
