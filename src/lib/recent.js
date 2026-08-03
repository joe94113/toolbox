/**
 * 記錄最近用過的工具，存在 localStorage。純邏輯，不碰 Vue。
 *
 * storage 開放成參數，測試時可以塞一個假的進來，
 * 不用真的去動瀏覽器的 localStorage。
 *
 * 所有讀寫都包在 try/catch 裡：使用者可能關掉了儲存空間、
 * 用無痕模式、或是空間滿了。這種情況下工具箱要照常運作，
 * 只是記不住最近使用而已，不能整頁壞掉。
 */

const KEY = 'toolbox:recent'
const DEFAULT_LIMIT = 8

function defaultStorage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

function read(storage) {
  if (!storage) return []
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // 舊格式或被人手動改壞時，把不合格的項目濾掉而不是整包丟棄
    return parsed.filter((item) => item && typeof item.id === 'string')
  } catch {
    return []
  }
}

function write(storage, entries) {
  if (!storage) return false
  try {
    storage.setItem(KEY, JSON.stringify(entries))
    return true
  } catch {
    return false
  }
}

/** 記錄一次使用。同一個工具再用會移到最前面而不是變成兩筆 */
export function recordVisit(id, options = {}) {
  const { storage = defaultStorage(), now = () => Date.now(), limit = DEFAULT_LIMIT } = options
  if (!id || typeof id !== 'string') return []

  const entries = read(storage).filter((item) => item.id !== id)
  entries.unshift({ id, at: now() })

  const capped = entries.slice(0, limit)
  write(storage, capped)
  return capped
}

/**
 * 取出最近使用的工具 id。
 * 傳入 knownIds 的話會把已經不存在的工具濾掉——
 * 工具改名或移除之後，舊紀錄還留著會變成點不開的卡片。
 */
export function getRecent(options = {}) {
  const { storage = defaultStorage(), knownIds = null, limit = DEFAULT_LIMIT } = options
  let entries = read(storage)

  if (knownIds) {
    const known = knownIds instanceof Set ? knownIds : new Set(knownIds)
    entries = entries.filter((item) => known.has(item.id))
  }

  return entries.slice(0, limit).map((item) => item.id)
}

export function clearRecent(options = {}) {
  const { storage = defaultStorage() } = options
  if (!storage) return
  try {
    storage.removeItem(KEY)
  } catch {
    // 清不掉就算了，不值得為此讓畫面壞掉
  }
}
