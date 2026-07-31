import { describe, it, expect } from 'vitest'
import { formatSql, minifySql } from './logic.js'

describe('formatSql', () => {
  it('把擠成一行的查詢排開', () => {
    const result = formatSql('select id,name from users where age>18')
    expect(result.ok).toBe(true)
    expect(result.value.split('\n').length).toBeGreaterThan(1)
  })

  it('預設把關鍵字轉大寫', () => {
    expect(formatSql('select 1').value).toContain('SELECT')
  })

  it('可以改成小寫', () => {
    expect(formatSql('SELECT 1', { keywordCase: 'lower' }).value).toContain('select')
  })

  it('認得不同方言', () => {
    const result = formatSql('SELECT * FROM `t`', { dialect: 'mysql' })
    expect(result.ok).toBe(true)
  })

  it('空字串回傳空結果', () => {
    expect(formatSql('  ')).toEqual({ ok: true, value: '' })
  })
})

describe('minifySql', () => {
  it('把多行壓成一行', () => {
    expect(minifySql('SELECT\n  id\nFROM users').value).toBe('SELECT id FROM users')
  })

  it('移除單行註解，避免壓行後吃掉後面的 SQL', () => {
    expect(minifySql('SELECT id -- 主鍵\nFROM users').value).toBe('SELECT id FROM users')
  })

  it('移除區塊註解', () => {
    expect(minifySql('SELECT /* 註解 */ id FROM users').value).toBe('SELECT id FROM users')
  })

  it('空字串回傳空結果', () => {
    expect(minifySql('')).toEqual({ ok: true, value: '' })
  })
})
