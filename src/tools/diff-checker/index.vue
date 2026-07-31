<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { compareText } from './logic.js'

const oldText = ref('')
const newText = ref('')
const mode = ref('lines')

const result = computed(() => compareText(oldText.value, newText.value, mode.value))
</script>

<template>
  <ToolShell title="Diff 文字比對">
    <p class="hint">左邊放原文、右邊放修改後的版本，不一樣的地方會標出來。</p>

    <div class="tabs">
      <button type="button" :class="{ active: mode === 'lines' }" @click="mode = 'lines'">逐行比對</button>
      <button type="button" :class="{ active: mode === 'words' }" @click="mode = 'words'">逐字比對</button>
    </div>

    <div class="columns">
      <textarea v-model="oldText" rows="6" class="area" placeholder="原文…"></textarea>
      <textarea v-model="newText" rows="6" class="area" placeholder="修改後…"></textarea>
    </div>

    <template v-if="oldText || newText">
      <div class="output-head">
        <span class="output-label">{{ result.value.hasChange ? '差異' : '兩段內容一樣' }}</span>
      </div>
      <pre class="output"><span
        v-for="(part, i) in result.value.parts"
        :key="i"
        :class="{ added: part.added, removed: part.removed }"
      >{{ part.text }}</span></pre>
    </template>
    <p v-else class="empty">兩邊都貼上內容後，差異會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; }
.tabs { display: inline-flex; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 1rem; }
.tabs button { padding: 0.5rem 0.9rem; border: none; background: var(--panel); color: var(--ink-soft); font-size: 0.85rem; cursor: pointer; }
.tabs button + button { border-left: 1px solid var(--line); }
.tabs button.active { background: var(--accent); color: var(--accent-ink); }
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1rem; }
.area { width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-size: 0.85rem; padding: 0.8rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); resize: vertical; }
.output-head { margin-bottom: 0.5rem; }
.output-label { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); }
.output { margin: 0; white-space: pre-wrap; word-break: break-all; font-family: var(--font-mono); font-size: 0.85rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); line-height: 1.7; }
.added { background: rgba(47, 107, 87, 0.18); color: var(--accent); }
.removed { background: rgba(179, 64, 44, 0.14); color: var(--danger); text-decoration: line-through; }
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }

@media (max-width: 520px) {
  .columns { grid-template-columns: 1fr; }
}
</style>
