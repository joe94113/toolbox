import { describe, it, expect } from 'vitest'
import { tokenize, parseCurl, toFetch, convert } from './logic.js'

describe('tokenize', () => {
  it('依空白切詞', () => {
    expect(tokenize('curl https://a.com').value).toEqual(['curl', 'https://a.com'])
  })

  it('單引號內的空白不切開', () => {
    expect(tokenize(`curl -H 'Content-Type: application/json'`).value).toEqual([
      'curl',
      '-H',
      'Content-Type: application/json',
    ])
  })

  it('雙引號內的跳脫字元處理得了', () => {
    expect(tokenize(`curl -d "a\\"b"`).value).toEqual(['curl', '-d', 'a"b'])
  })

  it('反斜線換行會先接起來', () => {
    expect(tokenize('curl \\\n  https://a.com').value).toEqual(['curl', 'https://a.com'])
  })

  it('保留空字串參數', () => {
    expect(tokenize(`curl -d ''`).value).toEqual(['curl', '-d', ''])
  })

  it('引號沒收尾會回報錯誤', () => {
    expect(tokenize(`curl -d 'abc`).ok).toBe(false)
  })
})

describe('parseCurl', () => {
  it('最簡單的 GET', () => {
    expect(parseCurl('curl https://api.example.com').value).toMatchObject({
      url: 'https://api.example.com',
      method: 'GET',
    })
  })

  it('有 body 但沒寫 -X 時預設 POST', () => {
    expect(parseCurl(`curl https://a.com -d 'x=1'`).value.method).toBe('POST')
  })

  it('-X 明確指定方法', () => {
    expect(parseCurl('curl -X DELETE https://a.com').value.method).toBe('DELETE')
  })

  it('解析多個 header', () => {
    const result = parseCurl(
      `curl https://a.com -H 'Content-Type: application/json' -H 'X-Token: abc'`
    )
    expect(result.value.headers).toEqual({
      'Content-Type': 'application/json',
      'X-Token': 'abc',
    })
  })

  it('header 值裡面有冒號也切得對', () => {
    expect(parseCurl(`curl https://a.com -H 'Referer: https://x.com/a'`).value.headers).toEqual({
      Referer: 'https://x.com/a',
    })
  })

  it('多個 -d 用 & 串起來', () => {
    expect(parseCurl(`curl https://a.com -d 'a=1' -d 'b=2'`).value.body).toBe('a=1&b=2')
  })

  it('略過不影響結果的旗標', () => {
    expect(parseCurl('curl -s -L -k https://a.com').value.url).toBe('https://a.com')
  })

  it('略過帶參數的無關旗標，不會把參數當成網址', () => {
    expect(parseCurl('curl -o out.txt https://a.com').value.url).toBe('https://a.com')
  })

  it('不是 curl 開頭會回報錯誤', () => {
    expect(parseCurl('wget https://a.com').ok).toBe(false)
  })

  it('沒有網址會回報錯誤', () => {
    expect(parseCurl('curl -X POST').ok).toBe(false)
  })

  it('空字串回傳空結果', () => {
    expect(parseCurl('')).toEqual({ ok: true, value: null })
  })
})

describe('toFetch', () => {
  it('產生基本的 fetch 呼叫', () => {
    const code = toFetch(parseCurl('curl https://a.com').value)
    expect(code).toContain('await fetch("https://a.com"')
    expect(code).toContain('method: "GET"')
  })

  it('JSON body 會用 JSON.stringify 包起來', () => {
    const code = toFetch(
      parseCurl(`curl https://a.com -H 'Content-Type: application/json' -d '{"a":1}'`).value
    )
    expect(code).toContain('JSON.stringify({"a":1})')
  })

  it('非 JSON body 原樣當字串', () => {
    const code = toFetch(parseCurl(`curl https://a.com -d 'a=1&b=2'`).value)
    expect(code).toContain('body: "a=1&b=2"')
  })

  it('-u 轉成 Basic 認證的 header', () => {
    const code = toFetch(parseCurl('curl -u user:pass https://a.com').value)
    expect(code).toContain('Authorization')
    expect(code).toContain('btoa')
  })
})

describe('convert', () => {
  it('一步到位給出程式碼', () => {
    expect(convert('curl https://a.com').value.code).toContain('await fetch')
  })

  it('錯誤會原封不動傳出來', () => {
    expect(convert('wget https://a.com').ok).toBe(false)
  })
})
