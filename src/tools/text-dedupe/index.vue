<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { processLines, countOccurrences } from './logic.js'

const input = ref('')
const trim = ref(true)
const removeEmpty = ref(true)
const dedupe = ref(true)
const ignoreCase = ref(false)
const sort = ref('none')
const showCounts = ref(false)

const result = computed(() =>
  processLines(input.value, {
    trim: trim.value,
    removeEmpty: removeEmpty.value,
    dedupe: dedupe.value,
    ignoreCase: ignoreCase.value,
    sort: sort.value,
  })
)

const counts = computed(() =>
  showCounts.value ? countOccurrences(input.value, { ignoreCase: ignoreCase.value }) : null
)
</script>

<template>
  <ToolShell title="文字整理">
    <p class="hint">
      一行一筆，貼進來就能去重複、排序、清掉空行。整理清單或日誌時很省事。
    </p>

    <textarea
      v-model="input"
      rows="8"
      class="area"
      placeholder="一行一筆貼進來…"
    ></textarea>

    <div class="opts">
      <label class="opt"><input v-model="dedupe" type="checkbox" /><span>去重複</span></label>
      <label class="opt"><input v-model="removeEmpty" type="checkbox" /><span>去空行</span></label>
      <label class="opt"><input v-model="trim" type="checkbox" /><span>去頭尾空白</span></label>
      <label class="opt"><input v-model="ignoreCase" type="checkbox" /><span>忽略大小寫</span></label>
      <label class="opt">
        <span>排序</span>
        <select v-model="sort" class="select">
          <option value="none">不排序</option>
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>
      </label>
      <label class="opt"><input v-model="showCounts" type="checkbox" /><span>算出現次數</span></label>
    </div>

    <template v-if="result.value">
      <p class="stats">
        原本 {{ result.value.originalCount }} 行 → 剩下 {{ result.value.resultCount }} 行
        <template v-if="result.value.removedCount > 0">
          （少了 {{ result.value.removedCount }} 行）
        </template>
      </p>

      <template v-if="counts && counts.value">
        <div class="output-head">
          <span class="output-label">出現次數</span>
        </div>
        <div class="counts">
          <div v-for="row in counts.value" :key="row.text" class="count-row">
            <span class="count-text">{{ row.text }}</span>
            <span class="count-num">{{ row.count }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="output-head">
          <span class="output-label">結果</span>
          <CopyButton :text="result.value.text" />
        </div>
        <pre class="output">{{ result.value.text }}</pre>
      </template>
    </template>

    <p v-else class="empty">貼上內容後，整理結果會顯示在這裡。</p>
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
  font-size: 0.88rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  resize: vertical;
  margin-bottom: 0.9rem;
}
.opts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 1.1rem;
}
.opt {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.select {
  font-family: inherit;
  font-size: 0.82rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.stats {
  margin: 0 0 0.8rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
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
.counts {
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
}
.count-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.8rem;
  border-top: 1px solid var(--line);
  background: var(--pegboard);
}
.count-row:first-child {
  border-top: none;
}
.count-text {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  word-break: break-all;
}
.count-num {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--ink-soft);
}
.empty {
  color: var(--ink-soft);
  font-size: 0.88rem;
  font-style: italic;
  margin: 0;
}
</style>
