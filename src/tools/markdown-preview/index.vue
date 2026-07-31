<script setup>
import { ref, computed } from 'vue'
import ToolShell from '../../components/ToolShell.vue'
import { renderMarkdown } from './logic.js'

const input = ref('# 標題\n\n寫一些 **重點**，或是列點：\n\n- 第一項\n- 第二項\n\n> 引言也可以')
const result = computed(() => renderMarkdown(input.value))
</script>

<template>
  <ToolShell title="Markdown 即時預覽">

    <div class="columns">
      <textarea v-model="input" rows="14" class="area" placeholder="在這裡寫 Markdown…"></textarea>
      <div class="preview" v-html="result.value"></div>
    </div>
  </ToolShell>
</template>

<style scoped>
.columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
.area {
  width: 100%; box-sizing: border-box; font-family: var(--font-mono); font-size: 0.85rem;
  padding: 0.9rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard); resize: vertical;
}
.preview {
  padding: 0.9rem 1.1rem; border: 1px solid var(--line); border-radius: 6px; background: var(--pegboard);
  overflow-wrap: break-word; font-size: 0.92rem;
}
.preview :deep(h1),
.preview :deep(h2),
.preview :deep(h3) {
  font-family: var(--font-display);
  margin: 0.6em 0 0.4em;
}
.preview :deep(p) { margin: 0.5em 0; line-height: 1.6; }
.preview :deep(ul),
.preview :deep(ol) { padding-left: 1.4em; }
.preview :deep(code) {
  font-family: var(--font-mono); background: var(--panel); padding: 0.1em 0.35em; border-radius: 3px; font-size: 0.85em;
}
.preview :deep(pre) {
  background: var(--panel); padding: 0.7em; border-radius: 6px; overflow-x: auto;
}
.preview :deep(blockquote) {
  margin: 0.6em 0; padding-left: 0.9em; border-left: 3px solid var(--accent); color: var(--ink-soft);
}
.preview :deep(a) { color: var(--accent); }

@media (max-width: 640px) {
  .columns { grid-template-columns: 1fr; }
}
</style>
