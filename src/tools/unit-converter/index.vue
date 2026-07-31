<script setup>
import { ref, computed, watch } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { CATEGORIES, convertUnit } from './logic.js'

const UNIT_LABELS = {
  mm: '毫米', cm: '公分', m: '公尺', km: '公里', inch: '英吋', foot: '英尺', yard: '碼', mile: '英里',
  mg: '毫克', g: '公克', kg: '公斤', ton: '公噸', oz: '盎司', lb: '磅',
  ml: '毫升', l: '公升', m3: '立方公尺', gallon: '加侖', cup: '杯',
  celsius: '攝氏 °C', fahrenheit: '華氏 °F', kelvin: '克氏 K',
}

const category = ref('length')
const fromUnit = ref('km')
const toUnit = ref('m')
const input = ref(1)

const unitKeys = computed(() => Object.keys(CATEGORIES[category.value].units))

watch(category, () => {
  const keys = unitKeys.value
  fromUnit.value = keys[0]
  toUnit.value = keys[1] ?? keys[0]
})

const result = computed(() => convertUnit(category.value, Number(input.value), fromUnit.value, toUnit.value))

function swap() {
  ;[fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value]
}
</script>

<template>
  <ToolShell title="單位轉換器">
    <p class="hint">選分類、選單位，數字馬上換算。</p>

    <div class="tabs">
      <button
        v-for="(cfg, key) in CATEGORIES"
        :key="key"
        type="button"
        :class="{ active: category === key }"
        @click="category = key"
      >
        {{ cfg.label }}
      </button>
    </div>

    <div class="convert-row">
      <div class="side">
        <input v-model.number="input" type="number" class="num-field" />
        <select v-model="fromUnit" class="unit-select">
          <option v-for="u in unitKeys" :key="u" :value="u">{{ UNIT_LABELS[u] }}</option>
        </select>
      </div>

      <button type="button" class="swap-btn" @click="swap" title="交換單位">⇄</button>

      <div class="side">
        <div class="num-display">{{ result.ok ? Number(result.value.toFixed(6)) : '—' }}</div>
        <select v-model="toUnit" class="unit-select">
          <option v-for="u in unitKeys" :key="u" :value="u">{{ UNIT_LABELS[u] }}</option>
        </select>
      </div>
    </div>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; }
.tabs { display: inline-flex; flex-wrap: wrap; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; margin-bottom: 1.25rem; }
.tabs button { padding: 0.5rem 0.85rem; border: none; background: var(--panel); color: var(--ink-soft); font-size: 0.85rem; cursor: pointer; }
.tabs button + button { border-left: 1px solid var(--line); }
.tabs button.active { background: var(--accent); color: var(--accent-ink); }
.convert-row { display: flex; align-items: center; gap: 0.75rem; }
.side { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.num-field, .num-display {
  font-family: var(--font-mono); font-size: 1.1rem; padding: 0.7rem 0.85rem;
  border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard);
}
.num-display { color: var(--accent); font-weight: 600; }
.unit-select { padding: 0.5rem 0.6rem; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); font-size: 0.85rem; }
.swap-btn {
  flex-shrink: 0; width: 2.2rem; height: 2.2rem; border-radius: 50%;
  border: 1px solid var(--line); background: var(--panel); color: var(--ink-soft);
  font-size: 1.1rem; cursor: pointer; margin-top: -1.6rem;
}
.swap-btn:hover { color: var(--accent); border-color: var(--accent); }
.error { margin: 1rem 0 0; color: var(--danger); font-weight: 500; }

@media (max-width: 480px) {
  .convert-row { flex-direction: column; }
  .swap-btn { margin-top: 0; transform: rotate(90deg); }
}
</style>
