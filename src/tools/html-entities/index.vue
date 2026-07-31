<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { encodeEntities, decodeEntities } from './logic.js'

const input = ref('')
const mode = ref('encode')
const encodeNonAscii = ref(false)

const result = computed(() =>
  mode.value === 'encode'
    ? encodeEntities(input.value, { encodeNonAscii: encodeNonAscii.value })
    : decodeEntities(input.value)
)
</script>

<template>
  <ToolShell title="HTML 實體編碼 / 解碼">
    <p class="hint">
      把 <code>&lt; &gt; &amp; " '</code> 轉成 HTML 實體，或反過來還原。
      要把一段程式碼貼進文章裡時很好用。
    </p>

    <div class="tabs">
      <button
        type="button"
        class="tab"
        :class="{ on: mode === 'encode' }"
        @click="mode = 'encode'"
      >
        編碼
      </button>
      <button
        type="button"
        class="tab"
        :class="{ on: mode === 'decode' }"
        @click="mode = 'decode'"
      >
        解碼
      </button>
    </div>

    <label v-if="mode === 'encode'" class="opt">
      <input v-model="encodeNonAscii" type="checkbox" />
      <span>連中文、emoji 也一起編碼成 &amp;#...; </span>
    </label>

    <textarea
      v-model="input"
      rows="6"
      class="area"
      :placeholder="mode === 'encode' ? '貼上原始文字…' : '貼上含 &amp;lt; 這類實體的文字…'"
    ></textarea>

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
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.hint code {
  font-family: var(--font-mono);
  font-size: 0.85em;
}
.tabs {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.9rem;
}
.tab {
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
  border: none;
  background: var(--pegboard);
  color: var(--ink-soft);
  cursor: pointer;
}
.tab.on {
  background: var(--ink);
  color: var(--panel);
}
.opt {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-bottom: 0.8rem;
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
.empty {
  color: var(--ink-soft);
  font-size: 0.88rem;
  font-style: italic;
  margin: 0;
}
</style>
