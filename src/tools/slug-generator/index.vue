<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { toSlug } from './logic.js'

const input = ref('')
const result = computed(() => toSlug(input.value))
</script>

<template>
  <ToolShell title="Slug 產生器">

    <input v-model="input" type="text" class="field" placeholder="例如：今天天氣真好！" />

    <template v-if="result.value">
      <div class="output-head">
        <span class="output-label">結果</span>
        <CopyButton :text="result.value" />
      </div>
      <pre class="output">{{ result.value }}</pre>
    </template>
    <p v-else class="empty">輸入標題後，結果會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.field {
  width: 100%;
  box-sizing: border-box;
  font-size: 0.95rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 1.1rem;
}
.output-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.output-label { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); }
.output {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }
</style>
