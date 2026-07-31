<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <div class="bench">
    <router-link to="/" class="back">← 回工具箱</router-link>
    <h1>{{ title }}</h1>
    <div class="surface">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bench {
  min-height: 100vh;
  max-width: 640px;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}

.back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--ink-soft);
  text-decoration: none;
  margin-bottom: 1.25rem;
}
.back:hover {
  color: var(--accent);
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 3.5vw, 2.1rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0 0 1.5rem;
}

.surface {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 1.5rem;
}
</style>
