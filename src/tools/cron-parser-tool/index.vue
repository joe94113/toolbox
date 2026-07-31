<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { parseCron } from './logic.js'

const input = ref('*/5 * * * *')
const result = computed(() => parseCron(input.value))
</script>

<template>
  <ToolShell title="Cron 表達式解析">

    <input v-model="input" type="text" class="field" placeholder="例如 */5 * * * *" />

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else-if="result.value">
      <p class="description">{{ result.value.description }}</p>

      <span class="output-label">接下來 5 次執行時間</span>
      <ol class="runs">
        <li v-for="(run, i) in result.value.nextRuns" :key="i">{{ run }}</li>
      </ol>
    </template>

    <p v-else class="empty">輸入 cron 表達式後，說明會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.field { width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-size: 1rem; padding: 0.7rem 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); margin-bottom: 1.1rem; }
.description { font-size: 1.05rem; font-weight: 500; margin: 0 0 1.1rem; padding: 0.8rem 1rem; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); }
.output-label { display: block; font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 0.4rem; }
.runs { margin: 0; padding-left: 1.3rem; font-family: var(--font-mono); font-size: 0.88rem; }
.runs li { margin-bottom: 0.3rem; }
.error { margin: 0; color: var(--danger); font-weight: 500; }
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }
</style>
