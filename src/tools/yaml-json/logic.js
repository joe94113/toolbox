/**
 * YAML ↔ JSON 互轉的核心邏輯。不要匯入 Vue 或碰 DOM。
 * 回傳格式統一是 { ok: true, value } 或 { ok: false, error }。
 */
import { load, dump } from 'js-yaml'

/**
 * js-yaml 的錯誤訊息是英文而且很長，抓出行號重寫成中文。
 * 使用者要的是「第幾行有問題」，不是完整的 parser 堆疊。
 */
function friendlyYamlError(e) {
  const line = e?.mark?.line
  const where = Number.isInteger(line) ? `第 ${line + 1} 行` : '某個地方'
  return `YAML 格式有問題（${where}）：${e?.reason || e?.message || '看不懂的內容'}`
}

export function yamlToJson(text, options = {}) {
  const { indent = 2 } = options
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: '' }

  try {
    // load 只認安全的核心型別，不會執行自訂標籤
    const data = load(raw)
    if (data === undefined) return { ok: true, value: '' }
    return { ok: true, value: JSON.stringify(data, null, indent) }
  } catch (e) {
    return { ok: false, error: friendlyYamlError(e) }
  }
}

export function jsonToYaml(text, options = {}) {
  const { indent = 2 } = options
  const raw = String(text ?? '')
  if (!raw.trim()) return { ok: true, value: '' }

  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    return { ok: false, error: `這段內容不是合法的 JSON：${e.message}` }
  }

  try {
    // lineWidth: -1 關掉自動折行，長字串被折斷之後很難讀也不好複製
    return { ok: true, value: dump(data, { indent, lineWidth: -1, noRefs: true }) }
  } catch (e) {
    return { ok: false, error: `轉成 YAML 時出錯：${e.message}` }
  }
}

/** 猜輸入的是哪一種格式，讓畫面可以自動切換方向 */
export function detectFormat(text) {
  const raw = String(text ?? '').trim()
  if (!raw) return null
  if (raw.startsWith('{') || raw.startsWith('[')) return 'json'
  return 'yaml'
}
