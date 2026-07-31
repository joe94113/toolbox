import { describe, it, expect } from 'vitest'
import { csvToJson, jsonToCsv } from './logic.js'

describe('csvToJson', () => {
  it('第一列當欄位名稱', () => {
    const json = JSON.parse(csvToJson('name,age\nAda,36\nBob,28').value)
    expect(json).toEqual([
      { name: 'Ada', age: 36 },
      { name: 'Bob', age: 28 },
    ])
  })

  it('數字會自動轉型', () => {
    const json = JSON.parse(csvToJson('n\n42').value)
    expect(json[0].n).toBe(42)
  })

  it('可以關掉自動轉型', () => {
    const json = JSON.parse(csvToJson('n\n42', { dynamicTyping: false }).value)
    expect(json[0].n).toBe('42')
  })

  it('處理得了引號裡的逗號', () => {
    const json = JSON.parse(csvToJson('name,note\nAda,"a,b"').value)
    expect(json[0].note).toBe('a,b')
  })

  it('處理得了欄位裡的換行', () => {
    const json = JSON.parse(csvToJson('name,note\nAda,"line1\nline2"').value)
    expect(json[0].note).toBe('line1\nline2')
  })

  it('可以不要標題列，輸出成陣列的陣列', () => {
    const json = JSON.parse(csvToJson('a,b\nc,d', { header: false }).value)
    expect(json).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('單欄 CSV 也能轉，不會被誤判成分隔符號錯誤', () => {
    const json = JSON.parse(csvToJson('name\nAda\nBob').value)
    expect(json).toEqual([{ name: 'Ada' }, { name: 'Bob' }])
  })

  it('引號沒收尾才算真的失敗', () => {
    const result = csvToJson('a,b\n1,"沒收尾')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('引號')
  })

  it('空字串回傳空結果', () => {
    expect(csvToJson('')).toEqual({ ok: true, value: '' })
  })
})

describe('jsonToCsv', () => {
  it('物件陣列轉成 CSV 並帶標題列', () => {
    expect(jsonToCsv('[{"name":"Ada","age":36}]').value).toBe('name,age\r\nAda,36')
  })

  it('含逗號的值會自動加引號', () => {
    expect(jsonToCsv('[{"note":"a,b"}]').value).toBe('note\r\n"a,b"')
  })

  it('可以換分隔符號', () => {
    expect(jsonToCsv('[{"a":1,"b":2}]', { delimiter: '\t' }).value).toBe('a\tb\r\n1\t2')
  })

  it('不是陣列會說清楚原因', () => {
    const result = jsonToCsv('{"a":1}')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('陣列')
  })

  it('陣列裡不是物件會擋下來', () => {
    expect(jsonToCsv('[1,2,3]').ok).toBe(false)
  })

  it('JSON 不合法時說清楚是 JSON 的問題', () => {
    expect(jsonToCsv('{broken}').error).toContain('不是合法的 JSON')
  })

  it('空陣列回傳空字串', () => {
    expect(jsonToCsv('[]')).toEqual({ ok: true, value: '' })
  })
})

describe('來回轉換', () => {
  it('CSV → JSON → CSV 內容一致', () => {
    const csv = 'name,age\r\nAda,36\r\nBob,28'
    const json = csvToJson(csv).value
    expect(jsonToCsv(json).value).toBe(csv)
  })
})
