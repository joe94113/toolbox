<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { formatBytes, estimateEncodedSize, buildSnippets, parseDataUri } from './logic.js'

const file = ref(null)
const dataUri = ref('')
const error = ref('')

function onPick(event) {
  const picked = event.target.files?.[0]
  if (!picked) return

  error.value = ''
  const reader = new FileReader()
  reader.onload = () => {
    dataUri.value = String(reader.result)
    file.value = { name: picked.name, size: picked.size, type: picked.type }
  }
  reader.onerror = () => {
    error.value = '這個檔案讀不出來'
    dataUri.value = ''
    file.value = null
  }
  reader.readAsDataURL(picked)
}

const snippets = computed(() => (dataUri.value ? buildSnippets(dataUri.value, file.value?.name || '') : null))
const encodedSize = computed(() => (file.value ? estimateEncodedSize(file.value.size) : null))

// 反向：貼一段 data URI 進來看看是什麼
const pasted = ref('')
const parsed = computed(() => parseDataUri(pasted.value))
</script>

<template>
  <ToolShell title="圖片轉 Base64">
    <p class="hint">
      把圖片變成 data URI，直接寫進 HTML 或 CSS 就不用再多一個檔案請求。
      檔案只在你的瀏覽器裡讀取，不會被上傳。
    </p>

    <label class="drop">
      <input type="file" accept="image/*" class="file" @change="onPick" />
      <span v-if="!file">點這裡選一張圖片</span>
      <span v-else>{{ file.name }}　（換一張）</span>
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="file && dataUri">
      <p class="stats">
        原始 {{ formatBytes(file.size) }} → 編碼後約 {{ formatBytes(encodedSize) }}
        <span class="warn">（Base64 會變大約三分之一，大圖片不建議內嵌）</span>
      </p>

      <img :src="dataUri" alt="預覽" class="preview" />

      <div class="output-head">
        <span class="output-label">Data URI</span>
        <CopyButton :text="dataUri" />
      </div>
      <pre class="output short">{{ dataUri }}</pre>

      <div class="output-head">
        <span class="output-label">HTML</span>
        <CopyButton :text="snippets.html" />
      </div>
      <pre class="output short">{{ snippets.html }}</pre>

      <div class="output-head">
        <span class="output-label">CSS</span>
        <CopyButton :text="snippets.css" />
      </div>
      <pre class="output short">{{ snippets.css }}</pre>
    </template>

    <hr class="rule" />

    <p class="hint">反過來，貼一段 data URI 進來看看它是什麼、多大。</p>
    <textarea
      v-model="pasted"
      rows="3"
      class="area"
      placeholder="data:image/png;base64,…"
    ></textarea>
    <p v-if="!parsed.ok" class="error">{{ parsed.error }}</p>
    <template v-else-if="parsed.value">
      <p class="stats">
        型別 <code>{{ parsed.value.mime }}</code> · 原始大小約
        {{ formatBytes(parsed.value.approxBytes) }}
      </p>
      <img :src="pasted.trim()" alt="貼上的圖片預覽" class="preview" />
    </template>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.drop {
  display: block;
  text-align: center;
  padding: 1.4rem;
  border: 1px dashed var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  color: var(--ink-soft);
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1rem;
}
.drop:hover {
  border-style: solid;
}
.file {
  display: none;
}
.stats {
  margin: 0 0 0.8rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.stats code {
  font-family: var(--font-mono);
}
.warn {
  opacity: 0.8;
}
.preview {
  max-width: 100%;
  max-height: 180px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 1rem;
}
.output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}
.output-label {
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.output {
  margin: 0 0 1rem;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 0.8rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.short {
  max-height: 7rem;
  overflow: auto;
}
.area {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  padding: 0.8rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  resize: vertical;
  margin-bottom: 0.8rem;
}
.rule {
  border: none;
  border-top: 1px solid var(--line);
  margin: 1.6rem 0 1.2rem;
}
.error {
  margin: 0 0 0.8rem;
  color: var(--danger);
  font-weight: 500;
}
</style>
