<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { calculateLoan } from './logic.js'

const principal = ref(1000000)
const annualRate = ref(2.5)
const years = ref(20)

const result = computed(() =>
  calculateLoan({
    principal: Number(principal.value),
    annualRatePercent: Number(annualRate.value),
    months: Math.round(Number(years.value) * 12),
  })
)

function formatMoney(n) {
  return Math.round(n).toLocaleString('zh-TW')
}
</script>

<template>
  <ToolShell title="貸款試算機">
    <p class="hint">輸入本金、年利率、還款年數，算出每月要繳多少（本息平均攤還）。</p>

    <div class="field-row">
      <label>本金</label>
      <input v-model.number="principal" type="number" class="field" min="0" />
    </div>
    <div class="field-row">
      <label>年利率（%）</label>
      <input v-model.number="annualRate" type="number" class="field" min="0" step="0.01" />
    </div>
    <div class="field-row">
      <label>還款年數</label>
      <input v-model.number="years" type="number" class="field" min="1" />
    </div>

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else>
      <div class="row">
        <span class="row-label">每月要繳</span>
        <span class="row-value">NT$ {{ formatMoney(result.value.monthlyPayment) }}</span>
      </div>
      <div class="row">
        <span class="row-label">總繳金額</span>
        <span class="row-value">NT$ {{ formatMoney(result.value.totalPayment) }}</span>
      </div>
      <div class="row">
        <span class="row-label">總利息</span>
        <span class="row-value">NT$ {{ formatMoney(result.value.totalInterest) }}</span>
      </div>
    </template>

    <p class="disclaimer">試算結果僅供參考，實際貸款條件請以銀行提供的為準。</p>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1.1rem; color: var(--ink-soft); font-size: 0.9rem; }
.field-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.8rem; }
.field-row label { font-size: 0.88rem; color: var(--ink-soft); flex-shrink: 0; }
.field {
  flex: 1; max-width: 12rem; text-align: right; font-family: var(--font-mono); font-size: 0.95rem;
  padding: 0.55rem 0.75rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard);
}
.row { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-top: 1px solid var(--line); }
.row:first-of-type { border-top: 1px solid var(--line); margin-top: 0.5rem; }
.row-label { font-size: 0.88rem; color: var(--ink-soft); }
.row-value { font-family: var(--font-mono); font-size: 1.05rem; font-weight: 600; color: var(--accent); }
.disclaimer { margin: 1rem 0 0; font-size: 0.76rem; color: var(--ink-soft); }
.error { margin: 0; color: var(--danger); font-weight: 500; }
</style>
