<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { countText } from './logic.js'

const input = ref('')
const stats = computed(() => countText(input.value).value)

const items = computed(() => [
  { label: '字數', value: stats.value.chars },
  { label: '不含空白', value: stats.value.charsNoSpace },
  { label: '字詞數', value: stats.value.words },
  { label: '行數', value: stats.value.lines },
  { label: '位元組數', value: stats.value.bytes },
])
</script>

<template>
  <ToolShell title="字數統計">

    <textarea v-model="input" rows="8" class="area" placeholder="在這裡打字或貼上內容…"></textarea>

    <div class="stats">
      <div class="stat" v-for="item in items" :key="item.label">
        <span class="stat-value">{{ item.value }}</span>
        <span class="stat-label">{{ item.label }}</span>
      </div>
    </div>
  </ToolShell>
</template>

<style scoped>
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
  margin-bottom: 1.25rem;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 0.75rem;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.8rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
}
.stat-value {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--ink-soft);
}
</style>
