<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { parseColor } from './logic.js'

const input = ref('#2f6b57')
const result = computed(() => parseColor(input.value))
</script>

<template>
  <ToolShell title="色碼轉換器">
    <p class="hint">輸入 HEX、RGB 或 HSL 任一種格式，另外兩種自動算給你。</p>

    <input
      v-model="input"
      type="text"
      class="field"
      placeholder="#3366ff 或 rgb(51,102,255) 或 hsl(220,100%,60%)"
    />

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else-if="result.value">
      <div class="preview" :style="{ background: result.value.swatch }"></div>

      <div class="row" v-for="fmt in [
        { label: 'HEX', value: result.value.hex },
        { label: 'RGB', value: result.value.rgb },
        { label: 'HSL', value: result.value.hsl },
      ]" :key="fmt.label">
        <span class="row-label">{{ fmt.label }}</span>
        <span class="row-value">{{ fmt.value }}</span>
        <CopyButton :text="fmt.value" />
      </div>
    </template>

    <p v-else class="empty">輸入顏色後，結果會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; }
.field {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 1.1rem;
}
.preview {
  height: 84px;
  border-radius: 6px;
  border: 1px solid var(--line);
  margin-bottom: 1rem;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-top: 1px solid var(--line);
}
.row:first-of-type { border-top: none; }
.row-label {
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  width: 3rem;
  flex-shrink: 0;
}
.row-value {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  flex: 1;
}
.error { margin: 0; color: var(--danger); font-weight: 500; }
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }
</style>
