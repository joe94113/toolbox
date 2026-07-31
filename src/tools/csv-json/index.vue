<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { csvToJson, jsonToCsv } from './logic.js'

const direction = ref('csv2json')
const input = ref('')
const header = ref(true)
const dynamicTyping = ref(true)

const result = computed(() =>
  direction.value === 'csv2json'
    ? csvToJson(input.value, { header: header.value, dynamicTyping: dynamicTyping.value })
    : jsonToCsv(input.value)
)

const labels = computed(() =>
  direction.value === 'csv2json'
    ? { from: 'CSV', to: 'JSON', placeholder: 'name,age\nAda,36\nBob,28' }
    : { from: 'JSON', to: 'CSV', placeholder: '[{ "name": "Ada", "age": 36 }]' }
)

function swap() {
  if (result.value.ok && result.value.value) input.value = result.value.value
  direction.value = direction.value === 'csv2json' ? 'json2csv' : 'csv2json'
}
</script>

<template>
  <ToolShell title="CSV ↔ JSON">
    <p class="hint">第一列會被當成欄位名稱。</p>

    <div class="bar">
      <span class="dir">{{ labels.from }} → {{ labels.to }}</span>
      <button type="button" class="swap" @click="swap">換方向</button>
    </div>

    <div v-if="direction === 'csv2json'" class="opts">
      <label class="opt"><input v-model="header" type="checkbox" /><span>第一列是標題</span></label>
      <label class="opt">
        <input v-model="dynamicTyping" type="checkbox" /><span>數字自動轉型</span>
      </label>
    </div>

    <textarea
      v-model="input"
      rows="9"
      class="area"
      :placeholder="labels.placeholder"
    ></textarea>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="output-head">
        <span class="output-label">{{ labels.to }}</span>
        <CopyButton :text="result.value" />
      </div>
      <pre class="output">{{ result.value }}</pre>
    </template>

    <p v-else class="empty">貼上內容後，結果會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.7rem;
}
.dir {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
}
.swap {
  font-family: inherit;
  font-size: 0.82rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
  cursor: pointer;
}
.swap:hover {
  background: var(--panel);
}
.opts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 0.8rem;
}
.opt {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
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
  margin-bottom: 1rem;
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
