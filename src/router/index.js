import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

// 自動掃描每個工具資料夾的 index.vue 與 meta.js
// 之後新增工具只要新增資料夾，不用手動改路由設定
const toolComponents = import.meta.glob('../tools/*/index.vue')
const toolMetas = import.meta.glob('../tools/*/meta.js', { eager: true })

// 首頁分組的顯示順序。meta.js 裡沒寫 category 的工具會被歸到「其他」，
// 排在最後面，這樣忘記填也不會整個消失。
export const CATEGORY_ORDER = [
  '編碼與雜湊',
  '文字處理',
  '資料格式',
  '開發輔助',
  '時間與排程',
  '換算與計算',
]
export const FALLBACK_CATEGORY = '其他'

export const tools = Object.keys(toolMetas).map((path) => {
  const id = path.split('/')[2] // ../tools/<id>/meta.js
  const meta = toolMetas[path].default
  return {
    ...meta,
    id,
    category: meta.category || FALLBACK_CATEGORY,
    path: `/tools/${id}`,
    component: toolComponents[`../tools/${id}/index.vue`],
  }
})

const SITE_TITLE = '工具箱'
const DEFAULT_DESCRIPTION =
  '免安裝、免登入的線上工具箱，JSON、色碼、Hash、正規表達式、Markdown 預覽等實用小工具，運算都在瀏覽器裡完成。'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: null, description: DEFAULT_DESCRIPTION },
  },
  ...tools.map((t) => ({
    path: t.path,
    name: t.id,
    component: t.component,
    meta: { title: t.name, description: t.description },
  })),
]

// 用 history mode，網址是真的 /tools/xxx，
// 這樣每個工具才能被搜尋引擎個別收錄、也才能被分享成獨立連結。
// GitHub Pages 是純靜態 host，重新整理子路徑本來會直接 404，
// 靠 public/404.html 的轉址技巧補上這塊（細節寫在那個檔案裡）。
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 換頁時同步更新 <title> 跟 meta description，
// 這樣搜尋引擎跟社群分享看到的每一頁才會是正確的標題跟說明，不會全部都一樣。
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title}｜${SITE_TITLE}` : `${SITE_TITLE}｜貼上內容，立刻拿到你要的結果`

  const description = to.meta.description || DEFAULT_DESCRIPTION
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title)
})

export default router
