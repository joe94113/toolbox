<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { convert } from './logic.js'

const input = ref('')
const result = computed(() => convert(input.value))
</script>

<template>
  <ToolShell title="curl 轉 fetch">
    <p class="hint">
      從瀏覽器開發工具「Copy as cURL」複製出來的指令，貼進來就能換成 fetch 寫法。
    </p>

    <textarea
      v-model="input"
      rows="7"
      class="area"
      spellcheck="false"
      placeholder="curl 'https://api.example.com/users' -H 'Content-Type: application/json' -d '{&quot;name&quot;:&quot;Ada&quot;}'"
    ></textarea>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="chips">
        <span class="chip method">{{ result.value.parsed.method }}</span>
        <span class="chip">{{ result.value.parsed.url }}</span>
      </div>

      <div class="output-head">
        <span class="output-label">fetch</span>
        <CopyButton :text="result.value.code" />
      </div>
      <pre class="output">{{ result.value.code }}</pre>
    </template>

    <p v-else class="empty">貼上 curl 指令後，程式碼會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.area {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  resize: vertical;
  margin-bottom: 1rem;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.chip {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--pegboard);
  color: var(--ink-soft);
  word-break: break-all;
}
.chip.method {
  background: var(--ink);
  color: var(--panel);
  border-color: var(--ink);
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
  word-break: break-word;
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
