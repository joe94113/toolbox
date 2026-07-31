<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { formatSql, minifySql, DIALECTS, KEYWORD_CASES } from './logic.js'

const input = ref('')
const dialect = ref('sql')
const keywordCase = ref('upper')
const mode = ref('format')

const result = computed(() =>
  mode.value === 'format'
    ? formatSql(input.value, { dialect: dialect.value, keywordCase: keywordCase.value })
    : minifySql(input.value)
)
</script>

<template>
  <ToolShell title="SQL 格式整理">
    <div class="tabs">
      <button
        type="button"
        class="tab"
        :class="{ on: mode === 'format' }"
        @click="mode = 'format'"
      >
        排開
      </button>
      <button
        type="button"
        class="tab"
        :class="{ on: mode === 'minify' }"
        @click="mode = 'minify'"
      >
        壓成一行
      </button>
    </div>

    <div v-if="mode === 'format'" class="controls">
      <label class="ctl">
        <span>方言</span>
        <select v-model="dialect" class="select">
          <option v-for="d in DIALECTS" :key="d.value" :value="d.value">{{ d.label }}</option>
        </select>
      </label>
      <label class="ctl">
        <span>關鍵字</span>
        <select v-model="keywordCase" class="select">
          <option v-for="k in KEYWORD_CASES" :key="k.value" :value="k.value">{{ k.label }}</option>
        </select>
      </label>
    </div>

    <textarea
      v-model="input"
      rows="8"
      class="area"
      placeholder="select id,name from users where age>18 order by name"
    ></textarea>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="output-head">
        <span class="output-label">結果</span>
        <CopyButton :text="result.value" />
      </div>
      <pre class="output">{{ result.value }}</pre>
    </template>

    <p v-else class="empty">貼上 SQL 後，結果會顯示在這裡。</p>
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
  margin-bottom: 0.9rem;
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
