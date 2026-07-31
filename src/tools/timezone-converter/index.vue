<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { convert, listTimezones, localTimezone, COMMON_ZONES } from './logic.js'

const zones = listTimezones()

function nowLocalInput() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const when = ref(nowLocalInput())
const fromZone = ref(localTimezone())
const targets = ref(
  // 預設挑幾個常見的，把使用者自己的時區排掉避免重複
  COMMON_ZONES.filter((z) => z !== localTimezone()).slice(0, 4)
)
const picker = ref('')

const result = computed(() => convert(when.value, fromZone.value, targets.value))

function addZone() {
  if (picker.value && !targets.value.includes(picker.value)) {
    targets.value.push(picker.value)
  }
  picker.value = ''
}

function removeZone(zone) {
  targets.value = targets.value.filter((z) => z !== zone)
}

function useNow() {
  when.value = nowLocalInput()
  fromZone.value = localTimezone()
}
</script>

<template>
  <ToolShell title="時區換算">
    <div class="controls">
      <label class="ctl">
        <span>時間</span>
        <input v-model="when" type="datetime-local" class="field" />
      </label>
      <label class="ctl">
        <span>所在時區</span>
        <select v-model="fromZone" class="select">
          <option v-for="z in zones" :key="z" :value="z">{{ z }}</option>
        </select>
      </label>
      <button type="button" class="now" @click="useNow">用現在時間</button>
    </div>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else>
      <div class="zones">
        <div v-for="row in result.value.zones" :key="row.zone" class="zone">
          <div class="zone-head">
            <span class="zone-name">{{ row.zone }}</span>
            <button type="button" class="remove" @click="removeZone(row.zone)" aria-label="移除">
              ×
            </button>
          </div>
          <div class="zone-time">{{ row.time }}</div>
          <div class="zone-meta">{{ row.date }} · {{ row.offset }}</div>
        </div>
      </div>

      <div class="add">
        <select v-model="picker" class="select">
          <option value="">加一個時區…</option>
          <option v-for="z in zones" :key="z" :value="z">{{ z }}</option>
        </select>
        <button type="button" class="addbtn" @click="addZone" :disabled="!picker">加入</button>
      </div>

      <div class="row">
        <span class="row-label">ISO</span>
        <span class="row-value">{{ result.value.iso }}</span>
        <CopyButton :text="result.value.iso" />
      </div>
      <div class="row">
        <span class="row-label">UNIX</span>
        <span class="row-value">{{ result.value.unix }}</span>
        <CopyButton :text="String(result.value.unix)" />
      </div>
    </template>
  </ToolShell>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
}
.ctl {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.field,
.select {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.now {
  font-family: inherit;
  font-size: 0.82rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
  cursor: pointer;
}
.zones {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.7rem;
  margin-bottom: 1rem;
}
.zone {
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.zone-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem;
}
.zone-name {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--ink-soft);
  word-break: break-all;
}
.remove {
  border: none;
  background: none;
  color: var(--ink-soft);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.15rem;
}
.remove:hover {
  color: var(--danger);
}
.zone-time {
  font-family: var(--font-mono);
  font-size: 1.35rem;
  margin: 0.15rem 0;
}
.zone-meta {
  font-size: 0.72rem;
  color: var(--ink-soft);
}
.add {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
}
.addbtn {
  font-family: inherit;
  font-size: 0.82rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
  cursor: pointer;
}
.addbtn:disabled {
  opacity: 0.5;
  cursor: default;
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
  width: 3.5rem;
  flex-shrink: 0;
}
.row-value {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  flex: 1;
  word-break: break-all;
}
.error {
  margin: 0;
  color: var(--danger);
  font-weight: 500;
}
</style>
