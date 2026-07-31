<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { escapeText, unescapeText, inspect, FORMATS } from './logic.js'

const input = ref('')
const mode = ref('escape')
const format = ref('js')
const asciiOnly = ref(true)
const showTable = ref(false)

const result = computed(() =>
  mode.value === 'escape'
    ? escapeText(input.value, format.value, { asciiOnly: asciiOnly.value })
    : unescapeText(input.value)
)

const table = computed(() => (showTable.value ? inspect(input.value) : null))
</script>

<template>
  <ToolShell title="Unicode 跳脫轉換">
    <div class="tabs">
      <button type="button" class="tab" :class="{ on: mode === 'escape' }" @click="mode = 'escape'">
        轉成跳脫
      </button>
      <button
        type="button"
        class="tab"
        :class="{ on: mode === 'unescape' }"
        @click="mode = 'unescape'"
      >
        還原
      </button>
    </div>

    <div v-if="mode === 'escape'" class="controls">
      <label class="ctl">
        <span>格式</span>
        <select v-model="format" class="select">
          <option v-for="f in FORMATS" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </label>
      <label class="ctl">
        <input v-model="asciiOnly" type="checkbox" />
        <span>只轉非 ASCII</span>
      </label>
    </div>
    <p v-else class="note">各種寫法都吃：\uXXXX、\u{XXXX}、\xXX、&amp;#xXXXX;、&amp;#DDDD;</p>

    <textarea
      v-model="input"
      rows="5"
      class="area"
      :placeholder="mode === 'escape' ? '貼上文字…' : '貼上 \\u4F60\\u597D…'"
    ></textarea>

    <label class="ctl">
      <input v-model="showTable" type="checkbox" />
      <span>顯示每個字元的字碼點</span>
    </label>

    <template v-if="table && table.value">
      <div class="chars">
        <div v-for="(c, i) in table.value" :key="i" class="char">
          <span class="glyph">{{ c.char }}</span>
          <span class="code">{{ c.hex }}</span>
        </div>
      </div>
    </template>

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
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.8rem;
}
.ctl {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.select {
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.note {
  margin: 0 0 0.8rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
  font-family: var(--font-mono);
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
  margin-bottom: 0.8rem;
}
.chars {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.8rem 0 1rem;
}
.char {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.3rem 0.45rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
}
.glyph {
  font-size: 1.05rem;
  line-height: 1.2;
}
.code {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--ink-soft);
}
.output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.9rem 0 0.5rem;
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
  margin: 0.9rem 0 0;
}
</style>
