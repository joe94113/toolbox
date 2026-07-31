<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { encodeBase64, decodeBase64 } from './logic.js'

const direction = ref('encode') // 'encode' | 'decode'
const input = ref('')

const result = computed(() =>
  direction.value === 'encode' ? encodeBase64(input.value) : decodeBase64(input.value)
)

function switchDirection(next) {
  if (next === direction.value) return
  // 切換方向時，如果目前有結果，直接把結果帶過去，
  // 這樣使用者不用自己複製貼上再切換
  if (result.value.ok && result.value.value) {
    input.value = result.value.value
  }
  direction.value = next
}
</script>

<template>
  <ToolShell title="Base64 編碼 / 解碼">
    <p class="hint">貼上文字或 Base64 內容，兩種格式互轉，中文也沒問題。</p>

    <div class="tabs">
      <button
        type="button"
        :class="{ active: direction === 'encode' }"
        @click="switchDirection('encode')"
      >
        文字 → Base64
      </button>
      <button
        type="button"
        :class="{ active: direction === 'decode' }"
        @click="switchDirection('decode')"
      >
        Base64 → 文字
      </button>
    </div>

    <textarea
      v-model="input"
      rows="5"
      class="area"
      :placeholder="direction === 'encode' ? '在這裡貼上原始文字…' : '在這裡貼上 Base64…'"
    ></textarea>

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
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
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.tabs {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.tabs button {
  padding: 0.5rem 0.9rem;
  border: none;
  background: var(--panel);
  color: var(--ink-soft);
  font-size: 0.85rem;
  cursor: pointer;
}
.tabs button + button {
  border-left: 1px solid var(--line);
}
.tabs button.active {
  background: var(--accent);
  color: var(--accent-ink);
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
