<script setup>
import { ref, watch } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { sign, verify, buildClaims, ALGORITHMS } from './logic.js'

const algorithm = ref('HS256')
const secret = ref('your-256-bit-secret')
const payload = ref(JSON.stringify(buildClaims({ subject: '1234567890' }), null, 2))

const token = ref('')
const error = ref('')

// 簽章是非同步的，打字快的時候會同時有好幾個在跑。
// 用序號記住「最新的那一次」，晚回來的舊結果就直接丟掉，
// 否則畫面上會停在過期的 token 或過期的錯誤訊息。
let signSeq = 0

async function regenerate() {
  const seq = ++signSeq
  const result = await sign(payload.value, secret.value, algorithm.value)
  if (seq !== signSeq) return

  if (!result.ok) {
    error.value = result.error
    token.value = ''
    return
  }
  error.value = ''
  token.value = result.value.token
}

watch([algorithm, secret, payload], regenerate, { immediate: true })

function fillClaims() {
  payload.value = JSON.stringify(buildClaims({ subject: '1234567890', expiresInSeconds: 3600 }), null, 2)
}

// 驗證區：貼一個 token 加密鑰，確認簽章對不對
const checkToken = ref('')
const checkSecret = ref('')
const checkResult = ref(null)
const checkError = ref('')

let verifySeq = 0

async function runVerify() {
  const seq = ++verifySeq
  checkResult.value = null
  checkError.value = ''
  if (!checkToken.value.trim()) return

  const result = await verify(checkToken.value, checkSecret.value)
  // 同上：期間又輸入了新內容的話，這次的結果已經過期了
  if (seq !== verifySeq) return

  if (!result.ok) {
    checkError.value = result.error
    return
  }
  checkResult.value = result.value.valid
}
</script>

<template>
  <ToolShell title="JWT 產生器">
    <p class="hint">
      簽出測試用的 token。運算都在瀏覽器裡完成，但還是
      <strong>不要把正式環境的密鑰貼進來</strong>。
    </p>

    <div class="controls">
      <label class="ctl">
        <span>演算法</span>
        <select v-model="algorithm" class="select">
          <option v-for="a in ALGORITHMS" :key="a.value" :value="a.value">{{ a.label }}</option>
        </select>
      </label>
      <button type="button" class="go" @click="fillClaims">填入常用欄位</button>
    </div>

    <label class="lbl">密鑰</label>
    <input v-model="secret" type="text" class="field" spellcheck="false" />

    <label class="lbl">Payload</label>
    <textarea v-model="payload" rows="8" class="area" spellcheck="false"></textarea>

    <p v-if="error" class="error">{{ error }}</p>

    <template v-else-if="token">
      <div class="output-head">
        <span class="output-label">Token</span>
        <CopyButton :text="token" />
      </div>
      <pre class="output token">{{ token }}</pre>
    </template>

    <hr class="rule" />

    <p class="sub">驗證簽章</p>
    <textarea
      v-model="checkToken"
      rows="3"
      class="area"
      spellcheck="false"
      placeholder="貼上要驗證的 token…"
      @input="runVerify"
    ></textarea>
    <input
      v-model="checkSecret"
      type="text"
      class="field"
      placeholder="用來驗證的密鑰"
      spellcheck="false"
      @input="runVerify"
    />
    <p v-if="checkError" class="error">{{ checkError }}</p>
    <p v-else-if="checkResult !== null" class="verdict" :class="{ yes: checkResult }">
      {{ checkResult ? '簽章正確' : '簽章對不上，密鑰或內容被改過' }}
    </p>
  </ToolShell>
</template>

<style scoped>
.hint {
  margin: 0 0 1.1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}
.ctl {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.lbl {
  display: block;
  font-size: 0.78rem;
  color: var(--ink-soft);
  margin-bottom: 0.3rem;
}
.select,
.go {
  font-family: inherit;
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: var(--pegboard);
  color: var(--ink);
}
.go {
  cursor: pointer;
  padding: 0.4rem 0.85rem;
}
.go:hover {
  background: var(--panel);
}
.field {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.88rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
  margin-bottom: 1rem;
}
.area {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.8rem;
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
  text-transform: uppercase;
  color: var(--ink-soft);
}
.output {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--pegboard);
}
.rule {
  border: none;
  border-top: 1px solid var(--line);
  margin: 1.6rem 0 1.1rem;
}
.sub {
  margin: 0 0 0.7rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.verdict {
  margin: 0;
  font-size: 0.9rem;
  color: var(--danger);
  font-weight: 500;
}
.verdict.yes {
  color: var(--accent);
}
.error {
  margin: 0 0 0.6rem;
  color: var(--danger);
  font-weight: 500;
}
</style>
