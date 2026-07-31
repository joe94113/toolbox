<script setup>
import { ref, watch } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { generatePassword } from './logic.js'

const length = ref(16)
const lower = ref(true)
const upper = ref(true)
const numbers = ref(true)
const symbols = ref(false)
const result = ref(null)

function generate() {
  result.value = generatePassword({
    length: length.value,
    lower: lower.value,
    upper: upper.value,
    numbers: numbers.value,
    symbols: symbols.value,
  })
}

watch([length, lower, upper, numbers, symbols], generate, { immediate: true })
</script>

<template>
  <ToolShell title="密碼產生器">
    <p class="hint">調整條件，密碼會自動重新產生；想換一組就按「重新產生」。</p>

    <div class="length-row">
      <label>長度：{{ length }}</label>
      <input type="range" min="4" max="64" v-model.number="length" />
    </div>

    <div class="checks">
      <label><input type="checkbox" v-model="lower" /> 小寫字母</label>
      <label><input type="checkbox" v-model="upper" /> 大寫字母</label>
      <label><input type="checkbox" v-model="numbers" /> 數字</label>
      <label><input type="checkbox" v-model="symbols" /> 符號</label>
    </div>

    <template v-if="result && !result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else-if="result">
      <div class="output-head">
        <span class="output-label">結果 · 強度 {{ result.value.strength }}</span>
        <div class="actions">
          <button type="button" class="regen-btn" @click="generate">重新產生</button>
          <CopyButton :text="result.value.password" />
        </div>
      </div>
      <pre class="output">{{ result.value.password }}</pre>
    </template>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1.1rem; color: var(--ink-soft); font-size: 0.9rem; }
.length-row { margin-bottom: 1rem; }
.length-row label { display: block; font-size: 0.85rem; color: var(--ink-soft); margin-bottom: 0.35rem; }
.length-row input[type='range'] { width: 100%; accent-color: var(--accent); }
.checks { display: flex; flex-wrap: wrap; gap: 0.9rem; margin-bottom: 1.25rem; font-size: 0.88rem; }
.checks label { display: flex; align-items: center; gap: 0.35rem; cursor: pointer; }
.output-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap; }
.output-label { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); }
.actions { display: flex; gap: 0.5rem; }
.regen-btn { padding: 0.55rem 0.9rem; border: 1px solid var(--line); border-radius: 5px; background: var(--panel); color: var(--ink-soft); font-size: 0.85rem; cursor: pointer; }
.regen-btn:hover { color: var(--accent); border-color: var(--accent); }
.output { margin: 0; white-space: pre-wrap; word-break: break-all; font-family: var(--font-mono); font-size: 1.05rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); }
.error { margin: 0; color: var(--danger); font-weight: 500; }
</style>
