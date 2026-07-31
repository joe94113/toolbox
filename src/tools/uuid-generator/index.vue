<script setup>
import { ref, computed, onMounted } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { generateUuids, inspectUuid } from './logic.js'

const count = ref(5)
const uppercase = ref(false)
const hyphens = ref(true)
const list = ref([])
const error = ref('')

function regenerate() {
  const result = generateUuids(count.value, {
    uppercase: uppercase.value,
    hyphens: hyphens.value,
  })
  if (!result.ok) {
    error.value = result.error
    list.value = []
    return
  }
  error.value = ''
  list.value = result.value
}

// 一進頁面就先給一批，不用再多按一次按鈕
onMounted(regenerate)

const allText = computed(() => list.value.join('\n'))

// 下半部：貼一個 id 進來檢查格式
const check = ref('')
const checked = computed(() => inspectUuid(check.value))
</script>

<template>
  <ToolShell title="UUID 產生器">
    <p class="hint">
      產生 v4 UUID，用的是瀏覽器內建的加密亂數（<code>crypto.randomUUID</code>）。
    </p>

    <div class="controls">
      <label class="ctl">
        <span>數量</span>
        <input v-model.number="count" type="number" min="1" max="100" class="num" />
      </label>
      <label class="ctl">
        <input v-model="uppercase" type="checkbox" />
        <span>大寫</span>
      </label>
      <label class="ctl">
        <input v-model="hyphens" type="checkbox" />
        <span>連字號</span>
      </label>
      <button type="button" class="go" @click="regenerate">重新產生</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <template v-else-if="list.length">
      <div class="output-head">
        <span class="output-label">結果（{{ list.length }} 個）</span>
        <CopyButton :text="allText" />
      </div>
      <pre class="output">{{ allText }}</pre>
    </template>

    <hr class="rule" />

    <p class="hint">貼一個 id 進來，檢查格式對不對、是第幾版。</p>
    <input
      v-model="check"
      type="text"
      class="field"
      placeholder="貼上要檢查的 UUID…"
    />
    <p v-if="!checked.ok" class="error">{{ checked.error }}</p>
    <p v-else-if="checked.value" class="verdict">
      格式正確，這是 <strong>v{{ checked.value.version }}</strong> UUID
    </p>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.hint code {
  font-family: var(--font-mono);
  font-size: 0.85em;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.1rem;
}
.ctl {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: var(--ink-soft);
}
.num {
  width: 4.5rem;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
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
.field {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 0.8rem;
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
.rule {
  border: none;
  border-top: 1px solid var(--line);
  margin: 1.6rem 0 1.2rem;
}
.verdict {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.error {
  margin: 0 0 0.5rem;
  color: var(--danger);
  font-weight: 500;
}
</style>
