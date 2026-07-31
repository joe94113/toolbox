<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { formatJson } from './logic.js'

const input = ref('{\n  "hello": "world",\n  "list": [1, 2, 3]\n}')
const compact = ref(false)

const result = computed(() => formatJson(input.value, compact.value ? 0 : 2))
</script>

<template>
  <ToolShell title="JSON 格式整理">

    <textarea
      v-model="input"
      rows="8"
      class="area"
      placeholder="在這裡貼上你的 JSON…"
    ></textarea>

    <label class="switch">
      <input type="checkbox" v-model="compact" />
      壓成一行
    </label>

    <template v-if="!result.ok">
      <p class="error">
        這段內容不是合法的 JSON，檢查看看括號、逗號有沒有漏掉或多打。
      </p>
      <p class="error-detail">{{ result.error }}</p>
    </template>

    <template v-else-if="result.value">
      <div class="output-head">
        <span class="output-label">結果</span>
        <CopyButton :text="result.value" />
      </div>
      <pre class="output">{{ result.value }}</pre>
    </template>

    <p v-else class="empty">貼上內容後，結果會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.area {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.88rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  resize: vertical;
}
.switch {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.85rem 0 1.1rem;
  font-size: 0.88rem;
  color: var(--ink-soft);
  cursor: pointer;
}
.output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.output-label {
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.output {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.error {
  margin: 0.25rem 0 0.35rem;
  color: var(--danger);
  font-weight: 500;
}
.error-detail {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
}
.empty {
  color: var(--ink-soft);
  font-size: 0.88rem;
  font-style: italic;
  margin: 0;
}
</style>
