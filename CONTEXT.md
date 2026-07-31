# CONTEXT.md — 這個專案的共同詞彙

寫這份文件是為了讓之後改這個專案的人（包含 AI agent）用同一套詞彙講話，
不用每次都重新猜「這個名詞在講什麼」。

## 核心詞彙

- **工具（tool）**：`src/tools/<id>/` 底下的一個功能單元，例如 JSON 格式整理、
  Base64 編解碼。每個工具都是自己獨立的資料夾，彼此不互相依賴。
- **邏輯（logic）**：`tools/<id>/logic.js`，工具的核心運算，寫成不依賴 Vue、
  不碰 DOM 的純函式。所有邏輯先在這裡用 `logic.test.js` 驗證過，才接到畫面上。
- **外殼（shell）**：`components/ToolShell.vue`，所有工具頁共用的版面
  （返回連結 + 標題 + 工作台）。工具頁只需要專心處理自己的輸入/輸出，
  不用重複刻版面。
- **工作台（bench）**：一個工具頁的主畫面，對應 `ToolShell` 裡的 `.surface`。
- **掛勾（hook）**：首頁上每一張連到工具的卡片，取自「洞洞板」視覺概念——
  每個工具就像掛在牆上的一件工具。對應 `views/Home.vue` 裡的 `.hook`。
- **結果（result）**：工具運算完的輸出，統一格式是
  `{ ok: true, value }` 或 `{ ok: false, error }`，畫面端只要判斷 `ok`
  就知道要顯示結果還是錯誤，不用到處寫 try/catch。

## 為什麼邏輯要跟畫面分開

`logic.js` 不能匯入 Vue 或碰 `document`，這樣才能離開瀏覽器直接用
`vitest` 測試，不用啟動畫面、不用點滑鼠，就能確認「壓縮 JSON 對不對」
「Base64 中文有沒有亂碼」這些行為正確。新增工具時，建議也照這個順序：
先寫 `logic.js` + `logic.test.js` 讓測試綠燈，再寫 `index.vue`。

## 決策記錄

- **造訪次數計數**：首頁用 `components/VisitorBadge.vue` 串接 hits.seeyoufarm.com
  的免費徽章服務，用瀏覽器當下的網址當識別碼，不用手動填自己的網域。
  這是特意選的「公開徽章」方案，不是完整分析工具——換來的代價是每次造訪
  都會把網址送到這個第三方服務，所以首頁文案也同步改成誠實描述這件事，
  沒有繼續講「不會被送到任何地方」。
- **測試環境用 jsdom，不是 happy-dom**：Markdown 預覽工具用 DOMPurify 消毒
  轉換後的 HTML，happy-dom 對某些標籤（例如 `<h1>`）的支援不完整，會讓
  DOMPurify 誤判把整個標籤拔掉，但這只是測試環境的問題，不是程式邏輯的
  問題——DOMPurify 官方測試環境本來就是用 jsdom。換成 jsdom 後測試就對了。
- **路由改成 history mode，換每個工具都能被搜尋引擎個別索引**：一開始為了
  簡單先用 hash mode（`/#/tools/xxx`），但代價是搜尋引擎不會把每個工具當成
  獨立頁面收錄。後來改成 history mode（真的 `/tools/xxx` 網址），搭配
  `public/404.html` 的轉址技巧（技巧出處：
  https://github.com/rafgraph/spa-github-pages）補上 GitHub Pages 沒有
  server-side rewrite 的問題——GitHub Pages 對找不到的路徑會導去
  `404.html`，那裡的腳本把路徑編碼進查詢字串轉回 `index.html`，
  `index.html` 開頭的腳本再把網址還原，全程在 Vue Router 初始化之前完成。
  `router/index.js` 的 `afterEach` 也會同步換每一頁的 `<title>` 跟
  meta description，這樣搜尋結果跟分享預覽才會顯示正確的內容，不會每頁都
  長一樣。
- **SEO 用的網址是 build 時自動算出來的，不是手動填的**：
  `.github/workflows/deploy.yml` 算出 `SITE_URL` 環境變數傳給
  `npm run build`，`vite.config.js` 的 `injectSiteUrl` plugin 用它替換
  `index.html` 裡的佔位網址，`scripts/generate-seo-files.js` 用它產生
  `sitemap.xml`／`robots.txt`。這樣以後加新工具、或者哪天換了 repo
  名稱，都不用手動去改任何寫死的網址。

## 文案原則

面向一般使用者，不是工程師：
- 用「貼上」「拿到結果」，不用「輸入」「輸出」「執行」這種系統語言
- 錯誤訊息要說清楚「哪裡有問題、怎麼修」，原始的技術錯誤訊息只當作
  次要的小字補充，不當主要訊息
- 按鈕文字要講「按下去會發生什麼事」，例如「複製結果」而不是「確定」
