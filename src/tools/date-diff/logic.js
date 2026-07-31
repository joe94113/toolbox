/**
 * 日期計算的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 全部用 UTC 中午當基準點來算「天數」：
 * 用午夜的話，跨日光節約時間的區間會因為那天只有 23 小時而少算一天。
 */

function toUtcNoon(text) {
  const m = String(text ?? '')
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12))
  // 檢查月份有沒有被進位（例如 2 月 31 日會變成 3 月）
  if (date.getUTCMonth() !== Number(m[2]) - 1 || date.getUTCDate() !== Number(m[3])) {
    return null
  }
  return date
}

const DAY_MS = 24 * 60 * 60 * 1000

/** 算出兩個日期之間差幾天、幾週，以及拆成年月日的說法 */
export function diffDates(fromText, toText, options = {}) {
  const { includeEnd = false } = options

  const from = toUtcNoon(fromText)
  const to = toUtcNoon(toText)
  if (!from || !to) {
    return { ok: false, error: '請選兩個有效的日期' }
  }

  const [early, late] = from <= to ? [from, to] : [to, from]
  const totalDays = Math.round((late - early) / DAY_MS) + (includeEnd ? 1 : 0)

  const breakdown = splitYearsMonthsDays(early, late)

  return {
    ok: true,
    value: {
      totalDays,
      weeks: Math.floor(totalDays / 7),
      remainderDays: totalDays % 7,
      businessDays: countBusinessDays(early, late, includeEnd),
      breakdown,
      backwards: from > to,
    },
  }
}

/**
 * 加月份時把日期夾在該月最後一天以內。
 * 1/31 加一個月應該是 2/29（閏年），不是溢位到 3/2。
 */
function addMonthsClamped(date, n) {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + n
  const lastDay = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate()
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), lastDay), 12))
}

/**
 * 拆成「幾年幾月又幾天」。
 *
 * 不用「借位」的寫法：1/31 到 3/1 借一次二月的 29 天還是不夠（會得到 -1 天）。
 * 改成先算出塞得下幾個完整月份，把起點推到那裡，剩下的直接數天數。
 */
export function splitYearsMonthsDays(early, late) {
  let totalMonths =
    (late.getUTCFullYear() - early.getUTCFullYear()) * 12 +
    (late.getUTCMonth() - early.getUTCMonth())

  // 不要用「日子有沒有走到」來猜最後一個月算不算整月：
  // 1/31 → 2/29 用猜的會少算一個月（29 < 31），但那其實是整整一個月。
  // 直接把起點推過去看有沒有超過終點，超過了才退一個月。
  if (totalMonths > 0 && addMonthsClamped(early, totalMonths) > late) totalMonths--
  if (totalMonths < 0) totalMonths = 0

  const anchor = addMonthsClamped(early, totalMonths)
  const days = Math.round((late - anchor) / DAY_MS)

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
  }
}

/** 算工作日（排除週六日），不含結束日除非指定 */
export function countBusinessDays(start, end, includeEnd = false) {
  let count = 0
  const cursor = new Date(start.getTime())
  const last = new Date(end.getTime())
  if (!includeEnd) last.setUTCDate(last.getUTCDate() - 1)

  while (cursor <= last) {
    const day = cursor.getUTCDay()
    if (day !== 0 && day !== 6) count++
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return count
}

/** 從某個日期往前或往後推幾天 */
export function shiftDate(fromText, amount, unit = 'days') {
  const from = toUtcNoon(fromText)
  if (!from) return { ok: false, error: '請選一個有效的日期' }

  const n = Number(amount)
  if (!Number.isFinite(n)) return { ok: false, error: '請輸入一個數字' }

  const result = new Date(from.getTime())
  if (unit === 'days') result.setUTCDate(result.getUTCDate() + n)
  else if (unit === 'weeks') result.setUTCDate(result.getUTCDate() + n * 7)
  else if (unit === 'months') result.setUTCMonth(result.getUTCMonth() + n)
  else if (unit === 'years') result.setUTCFullYear(result.getUTCFullYear() + n)
  else return { ok: false, error: '不認得這個單位' }

  return {
    ok: true,
    value: {
      iso: formatIso(result),
      weekday: WEEKDAYS[result.getUTCDay()],
    },
  }
}

const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']

export function formatIso(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function weekdayOf(text) {
  const date = toUtcNoon(text)
  return date ? WEEKDAYS[date.getUTCDay()] : null
}
