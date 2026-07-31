import { describe, it, expect } from 'vitest'
import { calculateLoan } from './logic.js'

describe('calculateLoan', () => {
  it('算出本息平均攤還的每月金額（100萬、年利率2.5%、20年）', () => {
    const result = calculateLoan({ principal: 1000000, annualRatePercent: 2.5, months: 240 })
    expect(result.ok).toBe(true)
    expect(result.value.monthlyPayment).toBeCloseTo(5299.03, 1)
    expect(result.value.totalInterest).toBeCloseTo(271766.94, 1)
  })

  it('年利率是 0 時，直接均分本金', () => {
    const result = calculateLoan({ principal: 12000, annualRatePercent: 0, months: 12 })
    expect(result.value.monthlyPayment).toBe(1000)
    expect(result.value.totalInterest).toBe(0)
  })

  it('本金不合法時回傳錯誤', () => {
    expect(calculateLoan({ principal: 0, annualRatePercent: 2, months: 12 }).ok).toBe(false)
    expect(calculateLoan({ principal: -100, annualRatePercent: 2, months: 12 }).ok).toBe(false)
  })

  it('期數不是正整數時回傳錯誤', () => {
    expect(calculateLoan({ principal: 1000, annualRatePercent: 2, months: 0 }).ok).toBe(false)
    expect(calculateLoan({ principal: 1000, annualRatePercent: 2, months: 1.5 }).ok).toBe(false)
  })

  it('利率是負數時回傳錯誤', () => {
    expect(calculateLoan({ principal: 1000, annualRatePercent: -1, months: 12 }).ok).toBe(false)
  })
})
