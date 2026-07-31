<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { tools, CATEGORY_ORDER, FALLBACK_CATEGORY } from '../router/index.js'
import { getRecent, clearRecent } from '../lib/recent.js'
import VisitorBadge from '../components/VisitorBadge.vue'

const router = useRouter()

const query = ref('')
const activeCategory = ref(null) // null 代表全部
const searchField = ref(null)
const filterBar = ref(null)
const stuck = ref(false)

// 只列出真的有工具的分類，並附上數量
const categories = computed(() => {
  const counts = new Map()
  for (const tool of tools) {
    counts.set(tool.category, (counts.get(tool.category) || 0) + 1)
  }
  return [...CATEGORY_ORDER, FALLBACK_CATEGORY]
    .filter((name) => counts.has(name))
    .map((name) => ({ name, count: counts.get(name) }))
})

// 搜尋字串與分類是「且」的關係：兩個都設就兩個條件都要滿足
const shown = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return tools.filter((tool) => {
    if (activeCategory.value && tool.category !== activeCategory.value) return false
    if (!keyword) return true
    return `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(keyword)
  })
})

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

// ---- 最近使用 ----
const recentIds = ref([])
const recentTools = computed(() =>
  recentIds.value.map((id) => tools.find((t) => t.id === id)).filter(Boolean)
)

// 有在搜尋或篩分類時就不顯示最近使用，那時候它只是干擾
const browsing = computed(() => !query.value.trim() && !activeCategory.value)

function loadRecent() {
  recentIds.value = getRecent({ knownIds: tools.map((t) => t.id), limit: 6 })
}

function forgetRecent() {
  clearRecent()
  recentIds.value = []
}

// ---- 鍵盤操作 ----
// 把畫面上所有卡片依實際排列順序編號，方向鍵才知道下一張是哪一張。
// 最近使用區的卡片會跟它在分類裡的本體重複出現，那是刻意的，
// 兩者是不同的 DOM 節點，各自有自己的編號。
const sections = computed(() => {
  const out = []
  let index = 0
  if (browsing.value && recentTools.value.length) {
    out.push({
      key: '__recent__',
      title: '最近使用',
      recent: true,
      items: recentTools.value.map((tool) => ({ tool, index: index++ })),
    })
  }
  for (const group of groups.value) {
    out.push({
      key: group.name,
      title: group.name,
      count: group.items.length,
      items: group.items.map((tool) => ({ tool, index: index++ })),
    })
  }
  return out
})

const navCount = computed(() =>
  sections.value.reduce((total, section) => total + section.items.length, 0)
)

const selected = ref(-1)

// 有在搜尋時把第一筆選起來，Enter 就能直接開最上面那個；
// 純瀏覽時不預選，免得畫面上一直有個沒人要的高亮。
watch([query, activeCategory], () => {
  selected.value = query.value.trim() && navCount.value ? 0 : -1
})

function flatTools() {
  return sections.value.flatMap((section) => section.items)
}

async function move(step) {
  if (!navCount.value) return
  const next = selected.value + step
  // 不繞回頭：到頂到底就停住，比較好預期
  selected.value = Math.min(navCount.value - 1, Math.max(0, next))
  await nextTick()
  document
    .querySelector(`[data-nav="${selected.value}"]`)
    ?.scrollIntoView({ block: 'nearest' })
}

function openSelected() {
  const entry = flatTools().find((item) => item.index === selected.value)
  if (entry) router.push(entry.tool.path)
}

function isTyping(target) {
  return target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

function onKeydown(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return

  // 斜線聚焦搜尋，但正在打字時要讓使用者能真的輸入斜線
  if (event.key === '/' && !isTyping(event.target)) {
    event.preventDefault()
    searchField.value?.focus()
    return
  }

  if (event.key === 'Escape') {
    if (query.value || activeCategory.value) {
      query.value = ''
      activeCategory.value = null
    } else {
      searchField.value?.blur()
      selected.value = -1
    }
    return
  }

  // 方向鍵只在搜尋框或頁面本身有焦點時作用
  const inSearch = event.target === searchField.value
  if (!inSearch && isTyping(event.target)) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    move(-1)
  } else if (event.key === 'Enter' && selected.value >= 0) {
    event.preventDefault()
    openSelected()
  }
}

// 吸附在頂端時才畫下緣的線；沒吸附時畫著會很突兀。
//
// 這裡不用 IntersectionObserver 加哨兵那套：position 是 sticky，
// 元素自己被黏住的當下 rect.top 就正好是 0，直接讀比多一個哨兵節點簡單。
function updateStuck() {
  const el = filterBar.value
  if (el) stuck.value = el.getBoundingClientRect().top <= 0
}

onMounted(() => {
  loadRecent()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', updateStuck, { passive: true })
  window.addEventListener('resize', updateStuck, { passive: true })
  updateStuck()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', updateStuck)
  window.removeEventListener('resize', updateStuck)
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

    <div ref="filterBar" class="filters" :class="{ stuck }">
      <div class="search">
        <input
          ref="searchField"
          v-model="query"
          type="search"
          class="search-field"
          placeholder="找工具…例如 JSON、顏色、時間"
          aria-label="搜尋工具"
        />
        <kbd class="slash" aria-hidden="true">/</kbd>
      </div>

      <div class="chips" role="tablist" aria-label="工具分類">
        <button
          type="button"
          class="chip"
          :class="{ on: !activeCategory }"
          role="tab"
          :aria-selected="!activeCategory"
          @click="activeCategory = null"
        >
          全部
          <span class="chip-count">{{ tools.length }}</span>
        </button>
        <button
          v-for="cat in categories"
          :key="cat.name"
          type="button"
          class="chip"
          :class="{ on: activeCategory === cat.name }"
          role="tab"
          :aria-selected="activeCategory === cat.name"
          @click="activeCategory = activeCategory === cat.name ? null : cat.name"
        >
          {{ cat.name }}
          <span class="chip-count">{{ cat.count }}</span>
        </button>
      </div>
    </div>

    <section v-for="section in sections" :key="section.key" class="group">
      <h2 class="group-title">
        <span>{{ section.title }}</span>
        <span v-if="section.count" class="group-count">{{ section.count }}</span>
        <button v-if="section.recent" type="button" class="forget" @click="forgetRecent">
          清除
        </button>
      </h2>

      <div class="grid">
        <router-link
          v-for="entry in section.items"
          :key="section.key + entry.tool.id"
          :to="entry.tool.path"
          class="hook"
          :class="{ selected: entry.index === selected }"
          :data-nav="entry.index"
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
              v-html="entry.tool.icon"
            ></svg>
          </span>
          <span class="label">{{ entry.tool.name }}</span>
          <span class="desc">{{ entry.tool.description }}</span>
        </router-link>
      </div>
    </section>

    <p v-if="!shown.length" class="nothing">
      <template v-if="query.trim()">沒有符合「{{ query }}」的工具，換個關鍵字試試。</template>
      <template v-else>這個分類目前沒有工具。</template>
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
  margin: 0 auto 2.5rem;
  text-align: center;
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--tag);
  margin: 0 0 0.9rem;
}

/* 字級刻意拉開距離：原本 h1 之外所有字都擠在 0.72–1.02rem 的窄帶裡，
   看起來沒有層次。標題放大、說明壓小，中間地帶清空。 */
h1 {
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 5vw, 3.1rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin: 0 0 0.8rem;
  color: var(--ink);
}

.lede {
  color: var(--ink-soft);
  margin: 0 auto;
  max-width: 30rem;
  font-size: 0.92rem;
}

.filters {
  position: sticky;
  top: 0;
  z-index: 5;
  /* 底下是點陣背景，這裡一定要不透明，否則捲動時會透出點點 */
  background: var(--pegboard);
  padding: 0.85rem 0;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.15s ease;
}

.filters.stuck {
  box-shadow: 0 1px 0 var(--line), 0 6px 12px -10px rgba(34, 38, 31, 0.5);
}

.search {
  position: relative;
  max-width: 380px;
  margin: 0 auto 0.7rem;
}

.search-field {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 2.2rem 0.6rem 0.9rem;
  font-family: inherit;
  font-size: 0.92rem;
  color: var(--ink);
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 999px;
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

.search-field:focus + .slash {
  opacity: 0;
}

.slash {
  position: absolute;
  right: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  line-height: 1;
  padding: 0.15rem 0.35rem;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: var(--ink-soft);
  background: var(--pegboard);
  pointer-events: none;
  transition: opacity 0.12s ease;
}

/* 不換行、超出就橫向捲：這樣吸附在頂端時永遠只有一行高，
   不會在窄螢幕上吃掉三行的垂直空間 */
.chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
  max-width: 880px;
  margin: 0 auto;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.chips::-webkit-scrollbar {
  display: none;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.32rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--panel);
  color: var(--ink-soft);
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.chip:hover {
  color: var(--ink);
}

.chip.on {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--panel);
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  opacity: 0.7;
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
  order: 1;
}

.group-count {
  font-size: 0.7rem;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line);
}

.forget {
  order: 2;
  font-family: inherit;
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
}

.forget:hover {
  background: var(--panel);
  color: var(--ink);
}

.grid {
  max-width: 880px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1.5rem 1.25rem;
}

/* 左對齊而不是置中：置中的內文是最強的「模板感」訊號，
   而且一整面置中卡片掃視起來比左對齊慢。標題與說明的起點對齊，
   眼睛只要沿著同一條垂直線往下掃就好。 */
.hook {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  padding: 1.3rem 1.2rem 1.35rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 6px;
  text-decoration: none;
  color: var(--ink);
  box-shadow: 0 1px 0 var(--line);
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}

.hook:hover {
  transform: translateY(-2px);
  border-color: var(--ink);
  box-shadow: 0 6px 14px -8px rgba(34, 38, 31, 0.35);
}

/* 鍵盤選取的樣子要比 hover 更明確，因為使用者的視線不在游標上 */
.hook.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
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
  margin-bottom: 0.6rem;
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

.hook:hover .peg,
.hook.selected .peg {
  color: var(--tag);
}

.label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.3;
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
