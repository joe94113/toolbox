# 工具箱

貼上內容、拿到結果、複製走人。純前端多工具網站，一個 repo，push 就自動上線。

## 設計方向

首頁把每個工具當成掛在「洞洞板工具牆」上的一件工具——找工具就是掃一眼牆上掛了什麼。
字型用 Space Grotesk（標題）+ Noto Sans TC（內文）+ IBM Plex Mono（資料/程式碼），
色調是米卡其洞洞板配深松綠，避開 AI 生成網站常見的米色+陶土色、或純黑+螢光色套路。

文案原則（詳見 `CONTEXT.md`）：對使用者說人話，不說「輸入/輸出/執行」；
錯誤訊息講清楚哪裡有問題、怎麼修，原始技術錯誤只當小字附註。

## 造訪次數

首頁下方會顯示一個造訪次數徽章（`components/VisitorBadge.vue`），串接
[hits.seeyoufarm.com](https://hits.seeyoufarm.com) 的免費服務，用瀏覽器
當下的網址當識別碼，部署後不用手動設定。這是刻意選的輕量方案，換來的
代價是每次造訪都會把網址送到這個第三方服務——所以首頁文案有同步講清楚，
不再宣稱「不會被送到任何地方」。決策細節寫在 `CONTEXT.md`。

## 網址、SEO 是自動處理的

`.github/workflows/deploy.yml` 部署時會自動算出你的實際網址
（`https://<帳號>.github.io/<repo>/`），透過 `SITE_URL` 環境變數傳給
`npm run build`。build 時會自動做兩件事，不用手動改任何檔案：

1. `scripts/generate-seo-files.js` 掃描 `src/tools/*` 產生
   `public/sitemap.xml`（列出首頁 + 每個工具的網址）跟 `public/robots.txt`。
2. `vite.config.js` 裡的 `injectSiteUrl` plugin 把 `index.html` 裡的
   佔位網址換成真實網址（`canonical`、`og:url`、`og:image`、`twitter:image`）。

**唯一要注意的例外**：如果你的 repo 名稱本身就是
`<你的帳號>.github.io`（部署在網域根目錄，不是子路徑），
要把 `public/404.html` 裡的 `pathSegmentsToKeep` 從 `1` 改成 `0`，
這個是靜態檔案，沒辦法跟著自動算——一般 repo 不用改，維持 `1` 就好。

## 開發

```bash
npm install
npm run dev     # 本機開發
npm test        # 跑邏輯測試
npm run build   # 打包
```

## 新增一個工具

```bash
npm run new-tool -- <id> "<顯示名稱>" "<描述>"
# 例如
npm run new-tool -- uuid-generator "UUID 產生器" "產生一組 v4 UUID"
```

會產生四個檔案：`meta.js`（名稱/描述）、`logic.js`（純邏輯）、
`logic.test.js`（邏輯的測試）、`index.vue`（畫面，套用共用的 ToolShell + CopyButton）。

**建議流程**：先把 `logic.test.js` 寫完、`npm test` 跑綠燈確認邏輯是對的，
再回去調 `index.vue` 的畫面跟文案。首頁清單跟路由是自動掃描 `src/tools/*`
產生的，新增資料夾後不用改任何其他設定。

## 部署到 GitHub Pages（自動）

1. push 這個 repo 到 GitHub。
2. 到 repo 的 **Settings → Pages → Build and deployment → Source**，選 **GitHub Actions**（只要設一次）。
3. 之後每次 push 到 `main`，`.github/workflows/deploy.yml` 就會自動測試、build、部署。

## 目錄結構

```
src/
  tools/
    <tool-id>/
      meta.js         # { name, description }
      logic.js         # 純運算邏輯（不碰 Vue/DOM）
      logic.test.js     # 邏輯測試
      index.vue         # 畫面
  components/
    ToolShell.vue    # 工具頁共用外殼（返回連結 + 標題 + 工作台）
    CopyButton.vue    # 共用複製按鈕
  views/
    Home.vue          # 首頁，洞洞板工具牆
  router/
    index.js          # 自動掃描 tools/* 產生路由
scripts/
  new-tool.js          # CLI 腳手架
.github/workflows/
  deploy.yml            # push 後自動測試 + build + 部署
CONTEXT.md               # 專案共同詞彙／文案原則
```
