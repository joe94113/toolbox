<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { yamlToJson, jsonToYaml } from './logic.js'

const direction = ref('yaml2json')
const input = ref('')

const result = computed(() =>
  direction.value === 'yaml2json' ? yamlToJson(input.value) : jsonToYaml(input.value)
)

const labels = computed(() =>
  direction.value === 'yaml2json'
    ? { from: 'YAML', to: 'JSON', placeholder: 'name: app\nreplicas: 3' }
    : { from: 'JSON', to: 'YAML', placeholder: '{ "name": "app", "replicas": 3 }' }
)

// 換方向時把目前的結果接著往下轉，比清空再重貼一次順手
function swap() {
  if (result.value.ok && result.value.value) input.value = result.value.value
  direction.value = direction.value === 'yaml2json' ? 'json2yaml' : 'yaml2json'
}
</script>

<template>
  <ToolShell title="YAML ↔ JSON">
    <div class="bar">
      <span class="dir">{{ labels.from }} → {{ labels.to }}</span>
      <button type="button" class="swap" @click="swap">換方向</button>
    </div>

    <textarea
      v-model="input"
      rows="9"
      class="area"
      :placeholder="labels.placeholder"
    ></textarea>

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="output-head">
        <span class="output-label">{{ labels.to }}</span>
        <CopyButton :text="result.value" />
      </div>
      <pre class="output">{{ result.value }}</pre>
    </template>

    <p v-else class="empty">貼上內容後，結果會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.7rem;
}
.dir {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
}
.swap {
  font-family: inherit;
  font-size: 0.82rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
  cursor: pointer;
}
.swap:hover {
  background: var(--panel);
}
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
  margin-bottom: 1rem;
}
.output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.output-label {
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
}
.output {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.error {
  margin: 0;
  color: var(--danger);
  font-weight: 500;
}
.empty {
  color: var(--ink-soft);
  font-size: 0.88rem;
  font-style: italic;
  margin: 0;
}
</style>
