<script setup>
import { tools } from '../router/index.js'
import VisitorBadge from '../components/VisitorBadge.vue'
</script>

<template>
  <div class="wall">
    <header class="intro">
      <p class="eyebrow">工具箱</p>
      <h1>需要什麼，就拿去用</h1>
      <p class="lede">
        貼上內容，立刻拿到你要的結果。每個工具的運算都留在你的瀏覽器裡，
        不會被送到任何地方——只有下面這個造訪次數，會送去計數服務登記一下。
      </p>
    </header>

    <div class="grid">
      <router-link
        v-for="t in tools"
        :key="t.id"
        :to="t.path"
        class="hook"
      >
        <span class="peg" aria-hidden="true"></span>
        <span class="label">{{ t.name }}</span>
        <span class="desc">{{ t.description }}</span>
      </router-link>
    </div>

    <footer class="foot">
      <VisitorBadge />
    </footer>
  </div>
</template>

<style scoped>
.wall {
  min-height: 100vh;
  padding: 3rem 1.5rem 5rem;
  background-image: radial-gradient(var(--line) 1.6px, transparent 1.6px);
  background-size: 26px 26px;
  background-position: 13px 13px;
}

.intro {
  max-width: 640px;
  margin: 0 auto 3rem;
  text-align: center;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tag);
  margin: 0 0 0.75rem;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: var(--ink);
}

.lede {
  color: var(--ink-soft);
  margin: 0;
  font-size: 1rem;
}

.grid {
  max-width: 880px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1.5rem 1.25rem;
}

.hook {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
  padding: 2.25rem 1.1rem 1.4rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  text-decoration: none;
  color: var(--ink);
  box-shadow: 0 1px 0 var(--line);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.hook:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px -6px rgba(34, 38, 31, 0.25);
}

.peg {
  position: absolute;
  top: 0.75rem;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--pegboard);
  border: 1px solid var(--line);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
}

.label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.02rem;
}

.desc {
  font-size: 0.82rem;
  color: var(--ink-soft);
  line-height: 1.5;
}

.foot {
  max-width: 880px;
  margin: 2.5rem auto 0;
  text-align: right;
}
</style>
