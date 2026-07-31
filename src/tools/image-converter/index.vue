<script setup>
import { ref, onBeforeUnmount } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import {
  FORMATS,
  formatBytes,
  calculateDimensions,
  clampQuality,
  outputFilename,
  savingPercent,
} from './logic.js'

const source = ref(null) // { name, size, width, height, url }
const target = ref(null) // { url, size, name, width, height }
const format = ref('image/webp')
const quality = ref(0.8)
const maxWidth = ref(0)
const busy = ref(false)
const error = ref('')

// object URL 不主動釋放會一直佔著記憶體，換圖或離開頁面時清掉
function releaseUrls() {
  if (source.value?.url) URL.revokeObjectURL(source.value.url)
  if (target.value?.url) URL.revokeObjectURL(target.value.url)
}
onBeforeUnmount(releaseUrls)

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('這個檔案讀不出來，可能不是圖片或格式不支援'))
    img.src = url
  })
}

async function onPick(event) {
  const file = event.target.files?.[0]
  if (!file) return

  releaseUrls()
  target.value = null
  error.value = ''

  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    source.value = {
      name: file.name,
      size: file.size,
      width: img.naturalWidth,
      height: img.naturalHeight,
      url,
    }
    await convert()
  } catch (e) {
    URL.revokeObjectURL(url)
    source.value = null
    error.value = e.message
  }
}

async function convert() {
  if (!source.value) return
  busy.value = true
  error.value = ''

  try {
    const dims = calculateDimensions(
      source.value.width,
      source.value.height,
      maxWidth.value,
      0
    )
    if (!dims.ok) throw new Error(dims.error)

    const img = await loadImage(source.value.url)
    const canvas = document.createElement('canvas')
    canvas.width = dims.value.width
    canvas.height = dims.value.height
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, format.value, clampQuality(quality.value, format.value))
    )
    if (!blob) throw new Error('這個瀏覽器不支援轉成這個格式，換一種試試')

    if (target.value?.url) URL.revokeObjectURL(target.value.url)
    target.value = {
      url: URL.createObjectURL(blob),
      size: blob.size,
      name: outputFilename(source.value.name, format.value),
      width: canvas.width,
      height: canvas.height,
    }
  } catch (e) {
    error.value = e.message
    target.value = null
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <ToolShell title="圖片壓縮 / 轉檔">
    <p class="hint">
      選一張圖，轉成 WebP、JPG 或 PNG 並順便壓縮。
      整個過程都在你的瀏覽器裡用 Canvas 做，圖片不會被上傳到任何地方。
    </p>

    <label class="drop">
      <input type="file" accept="image/*" class="file" @change="onPick" />
      <span v-if="!source">點這裡選一張圖片</span>
      <span v-else>{{ source.name }}　（換一張）</span>
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="source">
      <div class="controls">
        <label class="ctl">
          <span>輸出格式</span>
          <select v-model="format" class="select" @change="convert">
            <option v-for="f in FORMATS" :key="f.value" :value="f.value">{{ f.label }}</option>
          </select>
        </label>

        <label class="ctl" v-if="format !== 'image/png'">
          <span>品質 {{ Math.round(quality * 100) }}%</span>
          <input
            v-model.number="quality"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            @change="convert"
          />
        </label>

        <label class="ctl">
          <span>最大寬度</span>
          <input
            v-model.number="maxWidth"
            type="number"
            min="0"
            placeholder="0 = 不縮"
            class="num"
            @change="convert"
          />
        </label>
      </div>

      <div class="compare">
        <figure class="side">
          <img :src="source.url" alt="原圖" />
          <figcaption>
            原圖 · {{ source.width }}×{{ source.height }} · {{ formatBytes(source.size) }}
          </figcaption>
        </figure>

        <figure class="side" v-if="target">
          <img :src="target.url" alt="轉檔後" />
          <figcaption>
            轉檔後 · {{ target.width }}×{{ target.height }} · {{ formatBytes(target.size) }}
          </figcaption>
        </figure>
      </div>

      <div v-if="target" class="result">
        <p class="saving">
          <template v-if="savingPercent(source.size, target.size) > 0">
            省下 {{ savingPercent(source.size, target.size) }}%
          </template>
          <template v-else-if="savingPercent(source.size, target.size) < 0">
            反而大了 {{ -savingPercent(source.size, target.size) }}%，換個格式或調低品質試試
          </template>
          <template v-else>大小差不多</template>
        </p>
        <a :href="target.url" :download="target.name" class="download">
          下載 {{ target.name }}
        </a>
      </div>

      <p v-if="busy" class="busy">處理中…</p>
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
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.1rem;
}
.ctl {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.select,
.num {
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.num {
  width: 6rem;
}
.compare {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.9rem;
  margin-bottom: 1rem;
}
.side {
  margin: 0;
}
.side img {
  width: 100%;
  height: auto;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.side figcaption {
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: var(--ink-soft);
  font-family: var(--font-mono);
}
.result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.saving {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.download {
  font-size: 0.88rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--ink);
  color: var(--panel);
  text-decoration: none;
}
.busy {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.error {
  margin: 0 0 0.8rem;
  color: var(--danger);
  font-weight: 500;
}
</style>
