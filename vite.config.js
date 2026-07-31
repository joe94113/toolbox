import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// index.html 裡的佔位網址，build 時如果有 SITE_URL 環境變數就整批換成真實網址，
// 沒有的話（例如本機開發）就保持原樣，不影響開發。
const PLACEHOLDER_SITE = 'https://your-username.github.io/toolbox'

function injectSiteUrl() {
  return {
    name: 'inject-site-url',
    transformIndexHtml(html) {
      if (!process.env.SITE_URL) return html
      return html.replaceAll(PLACEHOLDER_SITE, process.env.SITE_URL)
    },
  }
}

// GitHub Pages 的專案頁面網址會是 https://<user>.github.io/<repo>/
// 所以打包出來的靜態資源路徑也要對應加上 /<repo>/ 前綴，
// 這個值由 GitHub Actions 在 build 時透過環境變數 GITHUB_PAGES_BASE 注入，
// 本機開發（npm run dev）則不需要，預設用 '/'
export default defineConfig({
  plugins: [vue(), injectSiteUrl()],
  base: process.env.GITHUB_PAGES_BASE || '/',
})
