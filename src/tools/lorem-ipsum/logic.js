/**
 * 假文產生器的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 */

const LATIN = `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud
exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure
in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur
sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim
id est laborum`
  .split(/\s+/)
  .filter(Boolean)

// 中文假文用常見字組，排版時看起來才像真的內文而不是一排方塊
const CJK = `這 個 系 統 的 設 計 目 標 是 讓 使 用 者 可 以 在 最 短 時 間 內 完 成 工 作
我 們 相 信 好 的 產 品 應 該 要 簡 單 直 接 而 且 值 得 信 賴
每 一 次 的 改 版 都 會 仔 細 考 慮 現 有 的 使 用 習 慣
資 料 處 理 全 部 在 本 機 完 成 不 會 上 傳 到 任 何 地 方`
  .split(/\s+/)
  .filter(Boolean)

const MAX = { words: 2000, sentences: 200, paragraphs: 50 }

/**
 * 可以塞入自己的亂數來源，測試時給一個固定序列就能斷言輸出。
 * 預設用 Math.random。
 */
function makePicker(words, random) {
  return () => words[Math.floor(random() * words.length)]
}

function buildSentence(pick, minWords, maxWords, random, joiner) {
  const count = minWords + Math.floor(random() * (maxWords - minWords + 1))
  const parts = Array.from({ length: count }, pick)
  return parts.join(joiner)
}

export function generate(options = {}) {
  const {
    unit = 'paragraphs',
    count = 3,
    language = 'latin',
    startWithLorem = true,
    random = Math.random,
  } = options

  const n = Number(count)
  const limit = MAX[unit]
  if (!Number.isInteger(n) || n < 1) {
    return { ok: false, error: '數量至少要 1' }
  }
  if (limit && n > limit) {
    return { ok: false, error: `一次最多 ${limit} ${unit === 'words' ? '個字' : '段'}` }
  }

  const isCjk = language === 'cjk'
  const words = isCjk ? CJK : LATIN
  const joiner = isCjk ? '' : ' '
  const pick = makePicker(words, random)

  if (unit === 'words') {
    const list = Array.from({ length: n }, pick)
    if (!isCjk && startWithLorem) {
      list.splice(0, Math.min(2, list.length), 'lorem', 'ipsum')
    }
    return { ok: true, value: list.join(joiner) }
  }

  const makeSentence = () => {
    const body = buildSentence(pick, isCjk ? 12 : 6, isCjk ? 30 : 14, random, joiner)
    if (isCjk) return `${body}。`
    return `${body.charAt(0).toUpperCase()}${body.slice(1)}.`
  }

  if (unit === 'sentences') {
    const list = Array.from({ length: n }, makeSentence)
    return { ok: true, value: list.join(isCjk ? '' : ' ') }
  }

  if (unit === 'paragraphs') {
    const paragraphs = Array.from({ length: n }, () => {
      const sentenceCount = 3 + Math.floor(random() * 3)
      return Array.from({ length: sentenceCount }, makeSentence).join(isCjk ? '' : ' ')
    })
    if (!isCjk && startWithLorem && paragraphs.length) {
      paragraphs[0] = `Lorem ipsum dolor sit amet, ${paragraphs[0]
        .charAt(0)
        .toLowerCase()}${paragraphs[0].slice(1)}`
    }
    return { ok: true, value: paragraphs.join('\n\n') }
  }

  return { ok: false, error: '不認得這個單位' }
}

/** 算出結果的字數與字元數，方便對照排版需求 */
export function measure(text) {
  const raw = String(text ?? '')
  const cjkCount = (raw.match(/[一-鿿]/g) || []).length
  const latinWords = (raw.match(/[A-Za-z]+/g) || []).length
  return {
    characters: raw.length,
    words: cjkCount + latinWords,
    paragraphs: raw.trim() ? raw.trim().split(/\n{2,}/).length : 0,
  }
}
