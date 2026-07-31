import { diffLines, diffWords } from 'diff'

/**
 * 比對兩段文字，回傳一段一段標好「新增/刪除/不變」的片段陣列，
 * 畫面端直接依 added/removed 上色就好。
 */
export function compareText(oldText, newText, mode = 'lines') {
  const diffFn = mode === 'words' ? diffWords : diffLines
  const parts = diffFn(oldText, newText)

  const hasChange = parts.some((p) => p.added || p.removed)

  return {
    ok: true,
    value: {
      parts: parts.map((p) => ({
        text: p.value,
        added: !!p.added,
        removed: !!p.removed,
      })),
      hasChange,
    },
  }
}
