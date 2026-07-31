<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { parseColor } from './logic.js'

const input = ref('#2f6b57')
const result = computed(() => parseColor(input.value))

// <input type="color"> 只吃 #rrggbb，所以拿目前算好的 HEX 餵它；
// 使用者還沒輸入或格式看不懂時，就先給一個預設值，避免它跳回黑色。
const swatch = computed(() =>
  result.value.ok && result.value.value ? result.value.value.swatch : null
)
const pickerValue = computed(() => swatch.value || '#2F6B57')

// 從色盤選色 → 寫回輸入框 → 沿用同一條 parseColor，RGB / HSL 就一起反推出來了
function pickColor(event) {
  input.value = event.target.value.toUpperCase()
}
</script>

<template>
  <ToolShell title="色碼轉換器">
    <p class="hint">
      輸入 HEX、RGB 或 HSL 任一種格式，另外兩種自動算給你；
      也可以點下面的色塊直接挑顏色，反推色碼。
    </p>

    <input
      v-model="input"
      type="text"
      class="field"
      placeholder="#3366ff 或 rgb(51,102,255) 或 hsl(220,100%,60%)"
    />

    <!-- 色塊一律顯示，就算目前輸入看不懂也留著，
         這樣使用者隨時能用色盤重新挑一個顏色把自己救回來 -->
    <label class="preview" :class="{ blank: !swatch }" :style="swatch ? { background: swatch } : null">
      <input type="color" class="picker" :value="pickerValue" @input="pickColor" />
      <span v-if="!swatch" class="preview-hint">點一下挑顏色</span>
    </label>

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else-if="result.value">
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
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84px;
  border-radius: 6px;
  border: 1px solid var(--line);
  margin-bottom: 1rem;
  cursor: pointer;
  transition: box-shadow 0.12s ease;
}
.preview:hover {
  box-shadow: 0 0 0 3px rgba(140, 125, 92, 0.35);
}
/* 鍵盤 focus 也要看得出來（原生 color input 被藏起來了，focus 環要畫在色塊上） */
.preview:focus-within {
  box-shadow: 0 0 0 3px var(--line);
}
.preview.blank {
  background: var(--pegboard);
  border-style: dashed;
}
.preview-hint {
  font-size: 0.82rem;
  color: var(--ink-soft);
}
/* 原生色盤本身不好看，把它縮到看不見，但保留可點擊與鍵盤可聚焦 */
.picker {
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  position: absolute;
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
