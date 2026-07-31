<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { convert } from './logic.js'

const input = ref('255')
const base = ref('auto')
const result = computed(() => convert(input.value, base.value))

const BASES = [
  { value: 'auto', label: '自動判斷' },
  { value: 2, label: '2 進位' },
  { value: 8, label: '8 進位' },
  { value: 10, label: '10 進位' },
  { value: 16, label: '16 進位' },
]

const ROWS = [
  { key: 'dec', label: 'DEC', note: '10' },
  { key: 'hex', label: 'HEX', note: '16' },
  { key: 'oct', label: 'OCT', note: '8' },
  { key: 'bin', label: 'BIN', note: '2' },
]
</script>

<template>
  <ToolShell title="進位轉換">
    <p class="hint">
      2、8、10、16 進位互轉。全程用 BigInt 計算，超過 2<sup>53</sup> 的大數字也不會失真。
    </p>

    <div class="controls">
      <input
        v-model="input"
        type="text"
        class="field"
        placeholder="輸入數字，可帶 0x / 0b / 0o 前綴"
      />
      <select v-model="base" class="select">
        <option v-for="b in BASES" :key="b.value" :value="b.value">{{ b.label }}</option>
      </select>
    </div>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="row" v-for="row in ROWS" :key="row.key">
        <span class="row-label">
          {{ row.label }}
          <span class="row-note">{{ row.note }}</span>
        </span>
        <span class="row-value">{{ result.value[row.key] }}</span>
        <CopyButton :text="result.value[row.key]" />
      </div>
    </template>

    <p v-else class="empty">輸入數字後，四種進位會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.controls {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
}
.field {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.select {
  font-family: inherit;
  font-size: 0.88rem;
  padding: 0.5rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  color: var(--ink);
}
.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-top: 1px solid var(--line);
}
.row:first-of-type {
  border-top: none;
}
.row-label {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  width: 4.5rem;
  flex-shrink: 0;
}
.row-note {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  opacity: 0.7;
}
.row-value {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  flex: 1;
  word-break: break-all;
}
.error {
  margin: 0;
  color: var(--danger);
  font-weight: 500;
}
.empty {
  color: var(--ink-soft);
  font-size: 0.88rem;
  font-style: italic;
  margin: 0;
}
</style>
