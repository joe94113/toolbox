function formatLocal(date) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const parts = new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (t) => parts.find((p) => p.type === t)?.value
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')} (${tz})`
}

/**
 * Unix 時間戳（秒或毫秒都接受，用位數判斷）→ 日期時間。
 */
export function timestampToDate(text) {
  const trimmed = text.trim()
  if (!trimmed) return { ok: true, value: null }

  const num = Number(trimmed)
  if (!Number.isFinite(num)) {
    return { ok: false, error: '這不是合法的數字，貼 10 碼（秒）或 13 碼（毫秒）的時間戳' }
  }

  const ms = trimmed.replace(/[.-]/g, '').length > 10 ? num : num * 1000
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: '這個數字換算出來不是合法的日期' }
  }

  return {
    ok: true,
    value: {
      local: formatLocal(date),
      utc: date.toISOString(),
    },
  }
}

/**
 * 日期時間字串（例如 <input type="datetime-local"> 的值，視為本地時間）→ 時間戳。
 */
export function dateToTimestamp(text) {
  const trimmed = text.trim()
  if (!trimmed) return { ok: true, value: null }

  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: '這個日期時間格式看不懂' }
  }

  const ms = date.getTime()
  return {
    ok: true,
    value: {
      seconds: String(Math.floor(ms / 1000)),
      milliseconds: String(ms),
      utc: date.toISOString(),
    },
  }
}
