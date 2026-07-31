<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import CopyButton from '../../components/CopyButton.vue'
import { parseCidr, contains } from './logic.js'

const input = ref('192.168.1.10/24')
const result = computed(() => parseCidr(input.value))

const check = ref('')
const checked = computed(() => {
  if (!check.value.trim()) return null
  return contains(input.value, check.value)
})

const ROWS = [
  { key: 'network', label: '網路位址' },
  { key: 'broadcast', label: '廣播位址' },
  { key: 'firstHost', label: '第一個主機' },
  { key: 'lastHost', label: '最後主機' },
  { key: 'mask', label: '子網路遮罩' },
  { key: 'wildcard', label: '萬用遮罩' },
]
</script>

<template>
  <ToolShell title="IP / 子網路計算">
    <input
      v-model="input"
      type="text"
      class="field"
      placeholder="192.168.1.10/24"
      spellcheck="false"
    />

    <p v-if="!result.ok" class="error">{{ result.error }}</p>

    <template v-else-if="result.value">
      <div class="summary">
        <div class="cidr">{{ result.value.cidr }}</div>
        <div class="tags">
          <span class="tag">{{ result.value.usableHosts.toLocaleString() }} 台可用主機</span>
          <span class="tag" :class="{ priv: result.value.isPrivate }">
            {{ result.value.isPrivate ? '私有位址' : '公開位址' }}
          </span>
        </div>
      </div>

      <div class="row" v-for="row in ROWS" :key="row.key">
        <span class="row-label">{{ row.label }}</span>
        <span class="row-value">{{ result.value[row.key] }}</span>
        <CopyButton :text="result.value[row.key]" />
      </div>

      <div class="row">
        <span class="row-label">總位址數</span>
        <span class="row-value">{{ result.value.totalAddresses.toLocaleString() }}</span>
      </div>

      <hr class="rule" />

      <p class="sub">檢查某個 IP 在不在這個網段裡</p>
      <input v-model="check" type="text" class="field" placeholder="192.168.1.99" />
      <p v-if="checked && !checked.ok" class="error">{{ checked.error }}</p>
      <p v-else-if="checked" class="verdict" :class="{ yes: checked.value }">
        {{ checked.value ? '在這個網段裡' : '不在這個網段裡' }}
      </p>
    </template>
  </ToolShell>
</template>

<style scoped>
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
.summary {
  margin-bottom: 1.1rem;
}
.cidr {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--pegboard);
  color: var(--ink-soft);
}
.tag.priv {
  color: var(--tag);
}
.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-top: 1px solid var(--line);
}
.row-label {
  font-size: 0.78rem;
  color: var(--ink-soft);
  width: 6rem;
  flex-shrink: 0;
}
.row-value {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  flex: 1;
}
.rule {
  border: none;
  border-top: 1px solid var(--line);
  margin: 1.4rem 0 1rem;
}
.sub {
  margin: 0 0 0.7rem;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.verdict {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ink-soft);
}
.verdict.yes {
  color: var(--accent);
  font-weight: 500;
}
.error {
  margin: 0 0 0.6rem;
  color: var(--danger);
  font-weight: 500;
}
</style>
