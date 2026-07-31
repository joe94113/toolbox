/**
 * 本息平均攤還試算。annualRatePercent 是年利率（例如 2.5 代表 2.5%）。
 */
export function calculateLoan({ principal, annualRatePercent, months }) {
  if (!Number.isFinite(principal) || principal <= 0) {
    return { ok: false, error: '本金要輸入大於 0 的數字' }
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return { ok: false, error: '年利率要輸入 0 或以上的數字' }
  }
  if (!Number.isInteger(months) || months <= 0) {
    return { ok: false, error: '期數要輸入大於 0 的整數（月）' }
  }

  const monthlyRate = annualRatePercent / 100 / 12

  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))

  const totalPayment = monthlyPayment * months
  const totalInterest = totalPayment - principal

  return {
    ok: true,
    value: {
      monthlyPayment,
      totalPayment,
      totalInterest,
    },
  }
}
