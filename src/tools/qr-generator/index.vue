<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import ToolShell from '../../components/ToolShell.vue'
import { ERROR_LEVELS, validateContent, buildWifiPayload } from './logic.js'

const mode = ref('text')
const text = ref('https://github.com')
const wifi = ref({ ssid: '', password: '', encryption: 'WPA', hidden: false })
const level = ref('M')
const size = ref(280)

const canvas = ref(null)
const renderError = ref('')

// 依模式組出真正要編碼的內容
const payload = computed(() => {
  if (mode.value === 'wifi') return buildWifiPayload(wifi.value)
  return { ok: true, value: text.value }
})

const checked = computed(() => {
  if (!payload.value.ok) return payload.value
  return validateContent(payload.value.value, level.value)
})

async function render() {
  renderError.value = ''
  if (!canvas.value || !checked.value.ok || !checked.value.value) return
  try {
    await QRCode.toCanvas(canvas.value, checked.value.value.text, {
      width: size.value,
      margin: 2,
      errorCorrectionLevel: level.value,
      color: { dark: '#22261f', light: '#fbfaf6' },
    })
  } catch (e) {
    renderError.value = e.message
  }
}

onMounted(render)
watch([checked, size, level], render, { deep: true })

function download() {
  if (!canvas.value) return
  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = canvas.value.toDataURL('image/png')
  link.click()
}
</script>

<template>
  <ToolShell title="QR Code 產生器">
    <p class="hint">
      把網址、一段文字或 Wi-Fi 連線資訊變成 QR Code，產生完可以直接存成 PNG。
    </p>

    <div class="tabs">
      <button type="button" class="tab" :class="{ on: mode === 'text' }" @click="mode = 'text'">
        網址 / 文字
      </button>
      <button type="button" class="tab" :class="{ on: mode === 'wifi' }" @click="mode = 'wifi'">
        Wi-Fi
      </button>
    </div>

    <template v-if="mode === 'text'">
      <textarea
        v-model="text"
        rows="3"
        class="area"
        placeholder="貼上網址或任何文字…"
      ></textarea>
    </template>

    <template v-else>
      <div class="fields">
        <label class="fld">
          <span>Wi-Fi 名稱</span>
          <input v-model="wifi.ssid" type="text" class="field" placeholder="SSID" />
        </label>
        <label class="fld" v-if="wifi.encryption !== 'nopass'">
          <span>密碼</span>
          <input v-model="wifi.password" type="text" class="field" />
        </label>
        <label class="fld">
          <span>加密方式</span>
          <select v-model="wifi.encryption" class="select">
            <option value="WPA">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">無密碼</option>
          </select>
        </label>
        <label class="ctl">
          <input v-model="wifi.hidden" type="checkbox" />
          <span>隱藏網路</span>
        </label>
      </div>
      <p class="note">
        密碼只會被編進圖片裡，一樣不會送到任何伺服器；但印出來的 QR 等同明碼，別貼在公開場合。
      </p>
    </template>

    <div class="controls">
      <label class="ctl">
        <span>容錯</span>
        <select v-model="level" class="select">
          <option v-for="l in ERROR_LEVELS" :key="l.value" :value="l.value">{{ l.label }}</option>
        </select>
      </label>
      <label class="ctl">
        <span>尺寸 {{ size }}px</span>
        <input v-model.number="size" type="range" min="120" max="600" step="20" />
      </label>
    </div>

    <p v-if="!checked.ok" class="error">{{ checked.error }}</p>
    <p v-else-if="renderError" class="error">{{ renderError }}</p>

    <template v-else-if="checked.value">
      <div class="stage">
        <canvas ref="canvas"></canvas>
      </div>
      <div class="foot">
        <span class="bytes">{{ checked.value.bytes }} / {{ checked.value.limit }} 位元組</span>
        <button type="button" class="download" @click="download">下載 PNG</button>
      </div>
    </template>

    <p v-else class="empty">輸入內容後，QR Code 會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.tabs {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.9rem;
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
.fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 0.6rem;
}
.fld {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.field {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
}
.note {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
  opacity: 0.9;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.1rem;
}
.ctl {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.select {
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.stage {
  display: flex;
  justify-content: center;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 0.7rem;
}
.stage canvas {
  max-width: 100%;
  height: auto;
}
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.bytes {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--ink-soft);
}
.download {
  font-family: inherit;
  font-size: 0.88rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--ink);
  color: var(--panel);
  cursor: pointer;
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
