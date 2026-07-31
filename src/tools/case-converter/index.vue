<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { convertCase } from './logic.js'

const input = ref('getUserName')
const result = computed(() => convertCase(input.value))

const FORMATS = [
  { key: 'camel', label: 'camelCase' },
  { key: 'pascal', label: 'PascalCase' },
  { key: 'snake', label: 'snake_case' },
  { key: 'kebab', label: 'kebab-case' },
  { key: 'constant', label: 'CONSTANT_CASE' },
  { key: 'dot', label: 'dot.case' },
  { key: 'title', label: 'Title Case' },
  { key: 'sentence', label: 'Sentence case' },
  { key: 'lower', label: 'lower case' },
  { key: 'upper', label: 'UPPER CASE' },
]
</script>

<template>
  <ToolShell title="命名格式轉換">
    <p class="hint">
      輸入任何一種寫法都可以，其他格式會一起算給你。camelCase、底線、連字號都認得。
    </p>

    <input
      v-model="input"
      type="text"
      class="field"
      placeholder="例如 getUserName 或 max_retry_count"
    />

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="row" v-for="fmt in FORMATS" :key="fmt.key">
        <span class="row-label">{{ fmt.label }}</span>
        <span class="row-value">{{ result.value[fmt.key] }}</span>
        <CopyButton :text="result.value[fmt.key]" />
      </div>
    </template>

    <p v-else class="empty">輸入文字後，各種格式會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.field {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 1.1rem;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-top: 1px solid var(--line);
}
.row:first-of-type {
  border-top: none;
}
.row-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: var(--ink-soft);
  width: 8.5rem;
  flex-shrink: 0;
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
