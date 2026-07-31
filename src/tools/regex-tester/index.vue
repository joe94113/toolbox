<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { testRegex } from './logic.js'

const pattern = ref('')
const flags = ref('g')
const text = ref('')

const result = computed(() => testRegex(pattern.value, flags.value, text.value))
</script>

<template>
  <ToolShell title="正規表達式測試器">
    <p class="hint">貼上 pattern 跟要測試的文字，符合的地方會即時標出來。</p>

    <div class="pattern-row">
      <span class="slash">/</span>
      <input v-model="pattern" type="text" class="pattern-field" placeholder="正規表達式，例如 \\d+" />
      <span class="slash">/</span>
      <input v-model="flags" type="text" class="flags-field" placeholder="flags" />
    </div>

    <textarea v-model="text" rows="6" class="area" placeholder="在這裡貼上要測試的文字…"></textarea>

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else>
      <div class="output-head">
        <span class="output-label">符合 {{ result.value.matches.length }} 個</span>
      </div>
      <pre class="output"><span
        v-for="(seg, i) in result.value.segments"
        :key="i"
        :class="{ matched: seg.matched }"
      >{{ seg.text }}</span></pre>
    </template>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; }
.pattern-row { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.8rem; }
.slash { font-family: var(--font-mono); color: var(--ink-soft); }
.pattern-field { flex: 1; font-family: var(--font-mono); font-size: 0.9rem; padding: 0.6rem 0.7rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); }
.flags-field { width: 4.5rem; font-family: var(--font-mono); font-size: 0.9rem; padding: 0.6rem 0.7rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); }
.area { width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-size: 0.88rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); resize: vertical; margin-bottom: 1rem; }
.output-head { margin-bottom: 0.5rem; }
.output-label { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); }
.output { margin: 0; white-space: pre-wrap; word-break: break-all; font-family: var(--font-mono); font-size: 0.85rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); line-height: 1.7; }
.matched { background: rgba(47, 107, 87, 0.22); color: var(--accent); border-radius: 2px; }
.error { margin: 0; color: var(--danger); font-weight: 500; }
</style>
