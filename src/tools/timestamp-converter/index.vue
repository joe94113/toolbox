<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { timestampToDate, dateToTimestamp } from './logic.js'

const direction = ref('toDate') // 'toDate' | 'toTimestamp'
const timestampInput = ref('')
const dateInput = ref('')

const result = computed(() =>
  direction.value === 'toDate' ? timestampToDate(timestampInput.value) : dateToTimestamp(dateInput.value)
)

function useNow() {
  if (direction.value === 'toDate') {
    timestampInput.value = String(Math.floor(Date.now() / 1000))
  } else {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    dateInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
}
</script>

<template>
  <ToolShell title="時間戳轉換器">
    <p class="hint">秒或毫秒都能貼，會自動判斷。</p>

    <div class="tabs">
      <button type="button" :class="{ active: direction === 'toDate' }" @click="direction = 'toDate'">
        時間戳 → 日期
      </button>
      <button type="button" :class="{ active: direction === 'toTimestamp' }" @click="direction = 'toTimestamp'">
        日期 → 時間戳
      </button>
    </div>

    <div class="input-row">
      <input
        v-if="direction === 'toDate'"
        v-model="timestampInput"
        type="text"
        class="field"
        placeholder="例如 1700000000 或 1700000000000"
      />
      <input v-else v-model="dateInput" type="datetime-local" class="field" />
      <button type="button" class="now-btn" @click="useNow">使用現在時間</button>
    </div>

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else-if="result.value">
      <div
        class="row"
        v-for="fmt in direction === 'toDate'
          ? [{ label: '本地時間', value: result.value.local }, { label: 'UTC', value: result.value.utc }]
          : [{ label: '秒', value: result.value.seconds }, { label: '毫秒', value: result.value.milliseconds }, { label: 'UTC', value: result.value.utc }]"
        :key="fmt.label"
      >
        <span class="row-label">{{ fmt.label }}</span>
        <span class="row-value">{{ fmt.value }}</span>
        <CopyButton :text="fmt.value" />
      </div>
    </template>

    <p v-else class="empty">輸入時間後，結果會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; }
.tabs { display: inline-flex; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 1rem; }
.tabs button { padding: 0.5rem 0.9rem; border: none; background: var(--panel); color: var(--ink-soft); font-size: 0.85rem; cursor: pointer; }
.tabs button + button { border-left: 1px solid var(--line); }
.tabs button.active { background: var(--accent); color: var(--accent-ink); }
.input-row { display: flex; gap: 0.6rem; margin-bottom: 1.1rem; }
.field {
  flex: 1;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.now-btn {
  padding: 0 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--ink-soft);
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
}
.now-btn:hover { color: var(--accent); border-color: var(--accent); }
.row { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; border-top: 1px solid var(--line); }
.row:first-of-type { border-top: none; }
.row-label { font-family: var(--font-display); font-size: 0.75rem; letter-spacing: 0.06em; color: var(--ink-soft); width: 4.5rem; flex-shrink: 0; }
.row-value { font-family: var(--font-mono); font-size: 0.9rem; flex: 1; word-break: break-all; }
.error { margin: 0; color: var(--danger); font-weight: 500; }
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }
</style>
