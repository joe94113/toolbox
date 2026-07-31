import { describe, it, expect } from 'vitest'
import { recordVisit, getRecent, clearRecent } from './recent.js'

// 最小的假 storage，行為跟 localStorage 一樣但存在記憶體裡
function fakeStorage(initial = {}) {
  const data = { ...initial }
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
    removeItem: (k) => {
      delete data[k]
    },
    _data: data,
  }
}

// 會拋錯的 storage：模擬無痕模式或空間已滿
const throwingStorage = {
  getItem: () => {
    throw new Error('storage disabled')
  },
  setItem: () => {
    throw new Error('quota exceeded')
  },
  removeItem: () => {
    throw new Error('nope')
  },
}

describe('recordVisit', () => {
  it('記下一次使用', () => {
    const storage = fakeStorage()
    recordVisit('base64', { storage })
    expect(getRecent({ storage })).toEqual(['base64'])
  })

  it('最新的排在最前面', () => {
    const storage = fakeStorage()
    recordVisit('a', { storage })
    recordVisit('b', { storage })
    recordVisit('c', { storage })
    expect(getRecent({ storage })).toEqual(['c', 'b', 'a'])
  })

  it('重複使用會移到最前面，不會變成兩筆', () => {
    const storage = fakeStorage()
    recordVisit('a', { storage })
    recordVisit('b', { storage })
    recordVisit('a', { storage })
    expect(getRecent({ storage })).toEqual(['a', 'b'])
  })

  it('超過上限時砍掉最舊的', () => {
    const storage = fakeStorage()
    for (const id of ['a', 'b', 'c', 'd']) recordVisit(id, { storage, limit: 3 })
    expect(getRecent({ storage })).toEqual(['d', 'c', 'b'])
  })

  it('id 不合法時不記錄', () => {
    const storage = fakeStorage()
    recordVisit('', { storage })
    recordVisit(null, { storage })
    recordVisit(123, { storage })
    expect(getRecent({ storage })).toEqual([])
  })

  it('storage 拋錯時不會炸掉', () => {
    expect(() => recordVisit('a', { storage: throwingStorage })).not.toThrow()
  })

  it('沒有 storage 可用時也不會炸掉', () => {
    expect(() => recordVisit('a', { storage: null })).not.toThrow()
    expect(getRecent({ storage: null })).toEqual([])
  })
})

describe('getRecent', () => {
  it('沒有紀錄時回傳空陣列', () => {
    expect(getRecent({ storage: fakeStorage() })).toEqual([])
  })

  it('內容不是合法 JSON 時當作沒有紀錄', () => {
    const storage = fakeStorage({ 'toolbox:recent': '{壞掉的' })
    expect(getRecent({ storage })).toEqual([])
  })

  it('內容不是陣列時當作沒有紀錄', () => {
    const storage = fakeStorage({ 'toolbox:recent': '{"a":1}' })
    expect(getRecent({ storage })).toEqual([])
  })

  it('濾掉格式不對的項目，但保留正常的', () => {
    const storage = fakeStorage({
      'toolbox:recent': JSON.stringify([{ id: 'ok', at: 1 }, null, { at: 2 }, 'x']),
    })
    expect(getRecent({ storage })).toEqual(['ok'])
  })

  it('濾掉已經不存在的工具', () => {
    const storage = fakeStorage()
    recordVisit('removed-tool', { storage })
    recordVisit('base64', { storage })
    expect(getRecent({ storage, knownIds: ['base64', 'json-formatter'] })).toEqual(['base64'])
  })

  it('knownIds 傳 Set 也可以', () => {
    const storage = fakeStorage()
    recordVisit('base64', { storage })
    expect(getRecent({ storage, knownIds: new Set(['base64']) })).toEqual(['base64'])
  })

  it('可以限制回傳數量', () => {
    const storage = fakeStorage()
    for (const id of ['a', 'b', 'c']) recordVisit(id, { storage })
    expect(getRecent({ storage, limit: 2 })).toEqual(['c', 'b'])
  })

  it('storage 拋錯時回傳空陣列而不是炸掉', () => {
    expect(getRecent({ storage: throwingStorage })).toEqual([])
  })
})

describe('clearRecent', () => {
  it('清掉所有紀錄', () => {
    const storage = fakeStorage()
    recordVisit('a', { storage })
    clearRecent({ storage })
    expect(getRecent({ storage })).toEqual([])
  })

  it('storage 拋錯時不會炸掉', () => {
    expect(() => clearRecent({ storage: throwingStorage })).not.toThrow()
  })
})
