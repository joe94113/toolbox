<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { jsonToTable } from './logic.js'

const input = ref('[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]')
const result = computed(() => jsonToTable(input.value))
</script>

<template>
  <ToolShell title="JSON 轉表格">
    <p class="hint">貼一個 JSON 陣列，比純文字更好讀。</p>

    <textarea v-model="input" rows="6" class="area" placeholder="在這裡貼上 JSON 陣列…"></textarea>

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else-if="result.value && result.value.headers.length">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th v-for="(h, i) in result.value.headers" :key="i">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in result.value.rows" :key="i">
              <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="count">共 {{ result.value.rows.length }} 筆</p>
    </template>

    <p v-else class="empty">貼上內容後，表格會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; }
.area { width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-size: 0.85rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); resize: vertical; margin-bottom: 1.1rem; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 6px; }
table { border-collapse: collapse; width: 100%; font-size: 0.85rem; }
th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--line); white-space: nowrap; }
th { font-family: var(--font-display); font-weight: 700; background: var(--panel); }
tbody tr:last-child td { border-bottom: none; }
tbody tr:nth-child(even) { background: rgba(140, 125, 92, 0.06); }
.count { margin: 0.6rem 0 0; font-size: 0.8rem; color: var(--ink-soft); }
.error { margin: 0; color: var(--danger); font-weight: 500; }
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }
</style>
