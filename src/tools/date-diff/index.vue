<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { diffDates, shiftDate, weekdayOf, formatIso } from './logic.js'

const today = formatIso(new Date())

const mode = ref('diff')

const from = ref(today)
const to = ref(today)
const includeEnd = ref(false)
const diff = computed(() => diffDates(from.value, to.value, { includeEnd: includeEnd.value }))

const base = ref(today)
const amount = ref(30)
const unit = ref('days')
const shifted = computed(() => shiftDate(base.value, amount.value, unit.value))

const UNITS = [
  { value: 'days', label: '天' },
  { value: 'weeks', label: '週' },
  { value: 'months', label: '個月' },
  { value: 'years', label: '年' },
]
</script>

<template>
  <ToolShell title="日期計算">
    <div class="tabs">
      <button type="button" class="tab" :class="{ on: mode === 'diff' }" @click="mode = 'diff'">
        相差多久
      </button>
      <button type="button" class="tab" :class="{ on: mode === 'shift' }" @click="mode = 'shift'">
        往前後推算
      </button>
    </div>

    <template v-if="mode === 'diff'">
      <div class="controls">
        <label class="ctl">
          <span>從</span>
          <input v-model="from" type="date" class="field" />
          <small>{{ weekdayOf(from) }}</small>
        </label>
        <label class="ctl">
          <span>到</span>
          <input v-model="to" type="date" class="field" />
          <small>{{ weekdayOf(to) }}</small>
        </label>
      </div>

      <label class="opt">
        <input v-model="includeEnd" type="checkbox" />
        <span>把結束日也算進去</span>
      </label>

      <p v-if="!diff.ok" class="error">{{ diff.error }}</p>

      <template v-else>
        <p v-if="diff.value.backwards" class="note">選的是往回算，下面是絕對差距。</p>

        <div class="big">
          {{ diff.value.totalDays }}<span class="unit">天</span>
        </div>

        <div class="row">
          <span class="row-label">拆解</span>
          <span class="row-value">
            {{ diff.value.breakdown.years }} 年
            {{ diff.value.breakdown.months }} 個月
            {{ diff.value.breakdown.days }} 天
          </span>
        </div>
        <div class="row">
          <span class="row-label">週</span>
          <span class="row-value">
            {{ diff.value.weeks }} 週又 {{ diff.value.remainderDays }} 天
          </span>
        </div>
        <div class="row">
          <span class="row-label">工作日</span>
          <span class="row-value">{{ diff.value.businessDays }} 天（不含週末）</span>
        </div>
      </template>
    </template>

    <template v-else>
      <div class="controls">
        <label class="ctl">
          <span>從</span>
          <input v-model="base" type="date" class="field" />
          <small>{{ weekdayOf(base) }}</small>
        </label>
        <label class="ctl">
          <span>推算</span>
          <input v-model.number="amount" type="number" class="num" />
        </label>
        <label class="ctl">
          <span>單位</span>
          <select v-model="unit" class="select">
            <option v-for="u in UNITS" :key="u.value" :value="u.value">{{ u.label }}</option>
          </select>
        </label>
      </div>
      <p class="note">填負數就是往前推。</p>

      <p v-if="!shifted.ok" class="error">{{ shifted.error }}</p>
      <template v-else>
        <div class="big">{{ shifted.value.iso }}</div>
        <p class="note">{{ shifted.value.weekday }}</p>
      </template>
    </template>
  </ToolShell>
</template>

<style scoped>
.tabs {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1rem;
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
  gap: 0.9rem;
  margin-bottom: 0.7rem;
}
.ctl {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.ctl small {
  font-size: 0.72rem;
  opacity: 0.8;
}
.field,
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
  width: 6rem;
}
.opt {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
  margin-bottom: 1.1rem;
}
.big {
  font-family: var(--font-display);
  font-size: 2.6rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 0.9rem;
}
.unit {
  font-size: 1rem;
  font-weight: 500;
  color: var(--ink-soft);
  margin-left: 0.3rem;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-top: 1px solid var(--line);
}
.row-label {
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  width: 4rem;
  flex-shrink: 0;
}
.row-value {
  font-size: 0.9rem;
  flex: 1;
}
.note {
  margin: 0 0 0.8rem;
  font-size: 0.82rem;
  color: var(--ink-soft);
}
.error {
  margin: 0;
  color: var(--danger);
  font-weight: 500;
}
</style>
