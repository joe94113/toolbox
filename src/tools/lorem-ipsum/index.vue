<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { generate, measure } from './logic.js'

const unit = ref('paragraphs')
const count = ref(3)
const language = ref('latin')
const startWithLorem = ref(true)
const seed = ref(0)

// seed 只是用來強迫重新計算，內容本身還是隨機的
const result = computed(() => {
  seed.value
  return generate({
    unit: unit.value,
    count: count.value,
    language: language.value,
    startWithLorem: startWithLorem.value,
  })
})

const stats = computed(() => (result.value.ok && result.value.value ? measure(result.value.value) : null))

const UNITS = [
  { value: 'paragraphs', label: '段' },
  { value: 'sentences', label: '句' },
  { value: 'words', label: '字' },
]
</script>

<template>
  <ToolShell title="假文產生器">
    <div class="controls">
      <label class="ctl">
        <span>數量</span>
        <input v-model.number="count" type="number" min="1" class="num" />
      </label>
      <label class="ctl">
        <span>單位</span>
        <select v-model="unit" class="select">
          <option v-for="u in UNITS" :key="u.value" :value="u.value">{{ u.label }}</option>
        </select>
      </label>
      <label class="ctl">
        <span>語言</span>
        <select v-model="language" class="select">
          <option value="latin">拉丁文</option>
          <option value="cjk">中文</option>
        </select>
      </label>
      <label class="ctl" v-if="language === 'latin'">
        <input v-model="startWithLorem" type="checkbox" />
        <span>以 Lorem ipsum 開頭</span>
      </label>
      <button type="button" class="go" @click="seed++">換一份</button>
    </div>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="output-head">
        <span class="output-label">
          {{ stats.words }} 字 · {{ stats.characters }} 字元
        </span>
        <CopyButton :text="result.value" />
      </div>
      <div class="output">{{ result.value }}</div>
    </template>
  </ToolShell>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.8rem;
  margin-bottom: 1.1rem;
}
.ctl {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.num,
.select {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.num {
  width: 5rem;
}
.go {
  margin-left: auto;
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
  cursor: pointer;
}
.go:hover {
  background: var(--panel);
}
.output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.output-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-soft);
}
.output {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 0.92rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.error {
  margin: 0;
  color: var(--danger);
  font-weight: 500;
}
</style>
