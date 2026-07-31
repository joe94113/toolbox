import { describe, it, expect } from 'vitest'
import { yamlToJson, jsonToYaml, detectFormat } from './logic.js'

describe('yamlToJson', () => {
  it('轉得出巢狀結構', () => {
    const yaml = 'name: app\nports:\n  - 80\n  - 443\n'
    expect(JSON.parse(yamlToJson(yaml).value)).toEqual({ name: 'app', ports: [80, 443] })
  })

  it('保留型別，不會把數字變字串', () => {
    const parsed = JSON.parse(yamlToJson('count: 3\nenabled: true\n').value)
    expect(parsed).toEqual({ count: 3, enabled: true })
  })

  it('可以調整縮排', () => {
    expect(yamlToJson('a: 1', { indent: 4 }).value).toBe('{\n    "a": 1\n}')
  })

  it('格式錯誤時回報中文訊息與行號', () => {
    const result = yamlToJson('a: 1\n  b: 2\n c: 3')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('YAML 格式有問題')
  })

  it('空字串回傳空結果', () => {
    expect(yamlToJson('   ')).toEqual({ ok: true, value: '' })
  })
})

describe('jsonToYaml', () => {
  it('轉得出巢狀結構', () => {
    expect(jsonToYaml('{"name":"app","ports":[80,443]}').value).toBe(
      'name: app\nports:\n  - 80\n  - 443\n'
    )
  })

  it('JSON 不合法時說清楚是 JSON 的問題', () => {
    const result = jsonToYaml('{broken}')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('不是合法的 JSON')
  })

  it('長字串不會被自動折行', () => {
    const long = 'x'.repeat(200)
    expect(jsonToYaml(JSON.stringify({ k: long })).value).toContain(long)
  })

  it('空字串回傳空結果', () => {
    expect(jsonToYaml('')).toEqual({ ok: true, value: '' })
  })
})

describe('來回轉換', () => {
  it('YAML → JSON → YAML 會回到原樣', () => {
    const yaml = 'name: app\nreplicas: 3\nlabels:\n  tier: web\n'
    const json = yamlToJson(yaml).value
    expect(jsonToYaml(json).value).toBe(yaml)
  })
})

describe('detectFormat', () => {
  it('大括號開頭當作 JSON', () => {
    expect(detectFormat('{"a":1}')).toBe('json')
  })

  it('中括號開頭也當作 JSON', () => {
    expect(detectFormat('[1,2]')).toBe('json')
  })

  it('其他當作 YAML', () => {
    expect(detectFormat('a: 1')).toBe('yaml')
  })

  it('空字串回傳 null', () => {
    expect(detectFormat('  ')).toBeNull()
  })
})
