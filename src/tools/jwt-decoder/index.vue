<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { decodeJwt } from './logic.js'

const input = ref('')
const result = computed(() => decodeJwt(input.value))
</script>

<template>
  <ToolShell title="JWT 解析器">
    <p class="hint">
      貼上 JWT，看裡面的 header 跟 payload。這只是解碼，<strong>不會驗證簽章</strong>，
      不代表這個 token 沒被改過或還沒過期。
    </p>

    <textarea v-model="input" rows="4" class="area" placeholder="在這裡貼上 JWT…"></textarea>

    <template v-if="!result.ok">
      <p class="error">{{ result.error }}</p>
    </template>

    <template v-else-if="result.value">
      <div class="block">
        <div class="output-head">
          <span class="output-label">Header</span>
          <CopyButton :text="result.value.header" />
        </div>
        <pre class="output">{{ result.value.header }}</pre>
      </div>

      <div class="block">
        <div class="output-head">
          <span class="output-label">Payload</span>
          <CopyButton :text="result.value.payload" />
        </div>
        <pre class="output">{{ result.value.payload }}</pre>
      </div>

      <p class="note">{{ result.value.signaturePresent ? '有簽章段（未驗證）' : '沒有簽章段' }}</p>
    </template>

    <p v-else class="empty">貼上 JWT 後，內容會顯示在這裡。</p>
  </ToolShell>
</template>

<style scoped>
.hint { margin: 0 0 1rem; color: var(--ink-soft); font-size: 0.9rem; line-height: 1.6; }
.area { width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-size: 0.85rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); resize: vertical; margin-bottom: 1.1rem; }
.block { margin-bottom: 1rem; }
.output-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.output-label { font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); }
.output { margin: 0; white-space: pre-wrap; word-break: break-all; font-family: var(--font-mono); font-size: 0.82rem; padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); }
.note { font-size: 0.8rem; color: var(--ink-soft); margin: 0; }
.error { margin: 0; color: var(--danger); font-weight: 500; }
.empty { color: var(--ink-soft); font-size: 0.88rem; font-style: italic; margin: 0; }
</style>
