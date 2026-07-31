<script setup>
import { ref, computed } from 'vue'
import { tools, CATEGORY_ORDER, FALLBACK_CATEGORY } from '../router/index.js'
import VisitorBadge from '../components/VisitorBadge.vue'

// 工具數量會一直長，純靠眼睛掃很累，所以給一個即時篩選。
// 名稱跟說明都比對，這樣打「顏色」也能找到「色碼轉換器」。
const query = ref('')
const shown = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) return tools
  return tools.filter((t) =>
    `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(keyword)
  )
})

// 依 CATEGORY_ORDER 分組；搜尋時整組沒東西就不顯示標題，
// 才不會留下一排空標題。
const groups = computed(() => {
  const order = [...CATEGORY_ORDER, FALLBACK_CATEGORY]
  const buckets = new Map(order.map((name) => [name, []]))
  for (const tool of shown.value) {
    if (!buckets.has(tool.category)) buckets.set(tool.category, [])
    buckets.get(tool.category).push(tool)
  }
  return order
    .map((name) => ({ name, items: buckets.get(name) || [] }))
    .filter((group) => group.items.length > 0)
})
</script>

<template>
  <div class="wall">
    <header class="intro">
      <p class="eyebrow">工具箱</p>
      <h1>需要什麼，就拿去用</h1>
      <!-- 這句刻意寫「貼上的內容」而不是「什麼都不送」：頁尾的計數器仍會送出一次瀏覽紀錄，
           講「貼上的內容」才不會講過頭。之後要改文案請維持這個範圍。 -->
      <p class="lede">
        每個工具的運算都留在你的瀏覽器裡，貼上的內容不會被送到任何地方。
      </p>
    </header>

    <div class="search">
      <input
        v-model="query"
        type="search"
        class="search-field"
        placeholder="找工具…例如 JSON、顏色、時間"
        aria-label="搜尋工具"
      />
    </div>

    <section v-for="group in groups" :key="group.name" class="group">
      <h2 class="group-title">
        <span>{{ group.name }}</span>
        <span class="group-count">{{ group.items.length }}</span>
      </h2>

      <div class="grid">
        <router-link
          v-for="t in group.items"
          :key="t.id"
          :to="t.path"
          class="hook"
        >
          <!-- icon 是我們自己寫在 meta.js 裡的靜態 SVG 路徑，沒有使用者輸入，v-html 是安全的 -->
          <span class="peg" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="t.icon"
            ></svg>
          </span>
          <span class="label">{{ t.name }}</span>
          <span class="desc">{{ t.description }}</span>
        </router-link>
      </div>
    </section>

    <p v-if="!shown.length" class="nothing">
      沒有符合「{{ query }}」的工具，換個關鍵字試試。
    </p>

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

.search {
  max-width: 380px;
  margin: 0 auto 2rem;
}

.search-field {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0.9rem;
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--ink);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 999px;
  text-align: center;
  transition: box-shadow 0.12s ease;
}

.search-field::placeholder {
  color: var(--ink-soft);
  opacity: 0.7;
}

.search-field:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(140, 125, 92, 0.3);
}

.nothing {
  max-width: 880px;
  margin: 2rem auto 0;
  text-align: center;
  color: var(--ink-soft);
  font-size: 0.9rem;
}

.group {
  max-width: 880px;
  margin: 0 auto 2.5rem;
}

/* 分類標題用一條細線往右延伸，像洞洞板上貼的標籤，
   不搶卡片的注意力，但掃視時能當作分段的錨點 */
.group-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--ink-soft);
}

.group-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
  opacity: 0.5;
}

.group-count {
  font-size: 0.7rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
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
  padding: 1.5rem 1.1rem 1.4rem;
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

/* 原本是一顆空的小圓點，看起來像沒載入的圖示；
   改成放工具圖示的圓形底座，洞洞板的感覺留著，但每張卡片終於長得不一樣了。
   同時不再用 absolute 定位，卡片頂端就不用留一大塊空白。 */
.peg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-bottom: 0.45rem;
  border-radius: 50%;
  background: var(--pegboard);
  border: 1px solid var(--line);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
  color: var(--ink-soft);
  transition: color 0.12s ease;
}

.peg svg {
  width: 18px;
  height: 18px;
}

.hook:hover .peg {
  color: var(--tag);
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
  /* 中文描述常常最後一行只剩一個字（「…每月要繳多／少」），看起來像壞掉。
     pretty 會幫忙把斷行往前挪，讓最後一行不落單；不支援的瀏覽器就維持原樣。 */
  text-wrap: pretty;
}

.foot {
  max-width: 880px;
  margin: 2.5rem auto 0;
  text-align: right;
}
</style>
