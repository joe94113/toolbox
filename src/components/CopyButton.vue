<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
})

const copied = ref(false)

async function copy() {
  if (!props.text) return
  await navigator.clipboard.writeText(props.text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <button class="copy-btn" type="button" :disabled="!text" @click="copy">
    {{ copied ? '已複製' : '複製結果' }}
  </button>
</template>

<style scoped>
.copy-btn {
  padding: 0.55rem 1.1rem;
  border: 1px solid var(--accent);
  border-radius: 5px;
  background: var(--accent);
  color: var(--accent-ink);
  font-weight: 500;
  font-size: 0.88rem;
  cursor: pointer;
  transition: opacity 0.12s ease;
}
.copy-btn:hover {
  opacity: 0.88;
}
.copy-btn:disabled {
  background: transparent;
  border-color: var(--line);
  color: var(--ink-soft);
  cursor: not-allowed;
}
</style>
