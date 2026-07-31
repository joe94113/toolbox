<script setup>
import { ref, computed, watch } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { buildExpression, describe, PRESETS, WEEKDAY_OPTIONS } from './logic.js'

const frequency = ref('daily')
const minute = ref(0)
const hour = ref(9)
const interval = ref(5)
const weekdays = ref([1])
const dayOfMonth = ref(1)

const built = computed(() =>
  buildExpression({
    frequency: frequency.value,
    minute: minute.value,
    hour: hour.value,
    interval: interval.value,
    weekdays: weekdays.value,
    dayOfMonth: dayOfMonth.value,
  })
)

// 使用者也可以直接改表達式，所以維護一份可編輯的副本
const expression = ref('')
watch(built, (b) => {
  if (b.ok) expression.value = b.value
}, { immediate: true })

const explained = computed(() => describe(expression.value))

function usePreset(preset) {
  expression.value = preset.expression
}

const FREQUENCIES = [
  { value: 'everyMinute', label: '每分鐘' },
  { value: 'everyNMinutes', label: '每 N 分鐘' },
  { value: 'hourly', label: '每小時' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每週' },
  { value: 'monthly', label: '每月' },
]
</script>

<template>
  <ToolShell title="Cron 產生器">
    <div class="presets">
      <button
        v-for="p in PRESETS"
        :key="p.expression"
        type="button"
        class="preset"
        @click="usePreset(p)"
      >
        {{ p.label }}
      </button>
    </div>

    <hr class="rule" />

    <div class="controls">
      <label class="ctl">
        <span>頻率</span>
        <select v-model="frequency" class="select">
          <option v-for="f in FREQUENCIES" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </label>

      <label class="ctl" v-if="frequency === 'everyNMinutes'">
        <span>每幾分鐘</span>
        <input v-model.number="interval" type="number" min="1" max="59" class="num" />
      </label>

      <label class="ctl" v-if="['daily', 'weekly', 'monthly'].includes(frequency)">
        <span>時</span>
        <input v-model.number="hour" type="number" min="0" max="23" class="num" />
      </label>

      <label class="ctl" v-if="['hourly', 'daily', 'weekly', 'monthly'].includes(frequency)">
        <span>分</span>
        <input v-model.number="minute" type="number" min="0" max="59" class="num" />
      </label>

      <label class="ctl" v-if="frequency === 'monthly'">
        <span>幾號</span>
        <input v-model.number="dayOfMonth" type="number" min="1" max="31" class="num" />
      </label>
    </div>

    <div v-if="frequency === 'weekly'" class="days">
      <label v-for="d in WEEKDAY_OPTIONS" :key="d.value" class="day">
        <input v-model="weekdays" type="checkbox" :value="d.value" />
        <span>{{ d.label }}</span>
      </label>
    </div>

    <p v-if="!built.ok" class="error">{{ built.error }}</p>

    <div class="expr-head">
      <span class="output-label">表達式（可以直接改）</span>
      <CopyButton :text="expression" />
    </div>
    <input v-model="expression" type="text" class="expr" spellcheck="false" />

    <p v-if="!explained.ok" class="error">{{ explained.error }}</p>

    <template v-else-if="explained.value">
      <p class="desc">{{ explained.value.description }}</p>
      <div class="output-label runs-label">接下來 5 次</div>
      <ul class="runs">
        <li v-for="(run, i) in explained.value.nextRuns" :key="i">{{ run }}</li>
      </ul>
    </template>
  </ToolShell>
</template>

<style scoped>
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.preset {
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--pegboard);
  color: var(--ink-soft);
  cursor: pointer;
}
.preset:hover {
  background: var(--panel);
  color: var(--ink);
}
.rule {
  border: none;
  border-top: 1px solid var(--line);
  margin: 1.1rem 0;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}
.ctl {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.select,
.num {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.num {
  width: 5rem;
}
.days {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.day {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.expr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0 0.4rem;
}
.output-label {
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
}
.expr {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 0.9rem;
}
.desc {
  margin: 0 0 1rem;
  font-size: 0.95rem;
}
.runs-label {
  margin-bottom: 0.4rem;
}
.runs {
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
}
.runs li {
  padding: 0.45rem 0.8rem;
  border-top: 1px solid var(--line);
  background: var(--pegboard);
  font-family: var(--font-mono);
  font-size: 0.85rem;
}
.runs li:first-child {
  border-top: none;
}
.error {
  margin: 0 0 0.6rem;
  color: var(--danger);
  font-weight: 500;
}
</style>
