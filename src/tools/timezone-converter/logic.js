/**
 * 時區換算的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 *
 * 全部靠瀏覽器內建的 Intl，不用額外套件。麻煩的地方在於
 * 「某個時區的牆上時間」對應到哪個 UTC 瞬間——這中間會被日光節約時間影響。
 */

const COMMON_ZONES = [
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
]

export function listTimezones() {
  // 瀏覽器支援的話給完整清單，不支援就退回常用的幾個
  const all = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : []
  return all.length ? all : COMMON_ZONES
}

export { COMMON_ZONES }

export function localTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

/**
 * 這個 UTC 瞬間，在指定時區顯示成幾點？回傳兩者的差（毫秒）。
 * 這就是該時區在那個當下的 UTC 偏移量。
 */
function zoneOffsetMs(instant, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)

  const map = {}
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value
  }

  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    // hour12:false 在某些環境會給 24 代表午夜，取模避免溢位
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second)
  )
  return asUtc - instant.getTime()
}

/**
 * 把「某時區的牆上時間」換算成真正的 UTC 瞬間。
 * 先用 UTC 當初猜，再用猜出來的偏移量修正一次——
 * 這一次修正是必要的，否則跨日光節約時間的換算會差一小時。
 */
export function wallTimeToInstant({ year, month, day, hour = 0, minute = 0 }, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute)
  let offset = zoneOffsetMs(new Date(guess), timeZone)
  let instant = guess - offset
  offset = zoneOffsetMs(new Date(instant), timeZone)
  return new Date(guess - offset)
}

/** 解析 <input type="datetime-local"> 給的 'YYYY-MM-DDTHH:mm' */
export function parseLocalInput(text) {
  const m = String(text ?? '')
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
  if (!m) return null
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
  }
}

export function formatInZone(instant, timeZone) {
  const date = new Intl.DateTimeFormat('zh-TW', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(instant)

  const time = new Intl.DateTimeFormat('zh-TW', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant)

  const offsetMinutes = zoneOffsetMs(instant, timeZone) / 60000
  const sign = offsetMinutes < 0 ? '-' : '+'
  const abs = Math.abs(offsetMinutes)
  const offset = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(
    abs % 60
  ).padStart(2, '0')}`

  return { date, time, offset }
}

export function convert(input, fromZone, toZones) {
  const parsed = parseLocalInput(input)
  if (!parsed) return { ok: false, error: '請選一個日期與時間' }

  try {
    const instant = wallTimeToInstant(parsed, fromZone)
    return {
      ok: true,
      value: {
        instant,
        iso: instant.toISOString(),
        unix: Math.floor(instant.getTime() / 1000),
        zones: toZones.map((zone) => ({ zone, ...formatInZone(instant, zone) })),
      },
    }
  } catch (e) {
    return { ok: false, error: `換算失敗：${e.message}` }
  }
}
