<script setup>
import { ref, watch } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { computeHash, SUPPORTED_ALGORITHMS } from './logic.js'

const input = ref('')
const algorithm = ref('SHA-256')
const result = ref({ ok: true, value: '' })

watch(
  [input, algorithm],
  async () => {
    result.value = await computeHash(input.value, algorithm.value)
  },
  { immediate: true }
)
</script>

<template>
  <ToolShell title="Hash 計算">
    <p class="hint">貼上文字，算出對應的雜湊值，常用來核對檔案或密碼有沒有被改動過。</p>

    <div class="tabs">
      <button
        v-for="algo in SUPPORTED_ALGORITHMS"
        :key="algo"
        type="button"
        :class="{ active: algorithm === algo }"
        @click="algorithm = algo"
      >
        {{ algo }}
      </button>
    </div>
    <p v-if="algorithm === 'SHA-1'" class="note">
      SHA-1 已經不適合用在安全性用途（例如密碼），只適合對照舊系統留下的雜湊值。
    </p>

    <textarea v-model="input" rows="5" class="area" placeholder="在這裡貼上文字…"></textarea>

    <template v-if="result.value">
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
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; }
.tabs { display: inline-flex; flex-wrap: wrap; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 0.6rem; }
.tabs button { padding: 0.5rem 0.85rem; border: none; background: var(--panel); color: var(--ink-soft); font-size: 0.82rem; cursor: pointer; }
.tabs button + button { border-left: 1px solid var(--line); }
.tabs button.active { background: var(--accent); color: var(--accent-ink); }
.note { font-size: 0.8rem; color: var(--tag); margin: 0 0 1rem; }
.area { width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-size: 0.88rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); resize: vertical; margin-bottom: 1rem; }
.output-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.output-label { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); }
.output { margin: 0; white-space: pre-wrap; word-break: break-all; font-family: var(--font-mono); font-size: 0.85rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); }
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }
</style>
