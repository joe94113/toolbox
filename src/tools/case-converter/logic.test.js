import { describe, it, expect } from 'vitest'
import { splitWords, convertCase } from './logic.js'

describe('splitWords', () => {
  it('拆得開空白與底線、連字號', () => {
    expect(splitWords('hello world_foo-bar')).toEqual(['hello', 'world', 'foo', 'bar'])
  })

  it('拆得開 camelCase', () => {
    expect(splitWords('getUserName')).toEqual(['get', 'User', 'Name'])
  })

  it('連續大寫後接單字也拆得對', () => {
    expect(splitWords('parseHTTPResponse')).toEqual(['parse', 'HTTP', 'Response'])
  })

  it('數字後接大寫視為新單字', () => {
    expect(splitWords('base64Encode')).toEqual(['base64', 'Encode'])
  })
})

describe('convertCase', () => {
  const value = (text) => convertCase(text).value

  it('從空白分隔轉出所有格式', () => {
    expect(value('hello world')).toMatchObject({
      camel: 'helloWorld',
      pascal: 'HelloWorld',
      snake: 'hello_world',
      kebab: 'hello-world',
      constant: 'HELLO_WORLD',
      dot: 'hello.world',
      title: 'Hello World',
    })
  })

  it('從 camelCase 也轉得回去', () => {
    expect(value('getUserName')).toMatchObject({
      snake: 'get_user_name',
      kebab: 'get-user-name',
      constant: 'GET_USER_NAME',
    })
  })

  it('從 CONSTANT_CASE 也轉得回去', () => {
    expect(value('MAX_RETRY_COUNT')).toMatchObject({
      camel: 'maxRetryCount',
      pascal: 'MaxRetryCount',
    })
  })

  it('句首大寫只動第一個字', () => {
    expect(value('hello world').sentence).toBe('Hello world')
  })

  it('空字串回傳空結果', () => {
    expect(convertCase('')).toEqual({ ok: true, value: null })
  })

  it('只有符號會回報錯誤', () => {
    expect(convertCase('---').ok).toBe(false)
  })
})
