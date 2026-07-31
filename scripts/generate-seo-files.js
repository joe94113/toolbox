import { readdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const toolsDir = join(__dirname, '..', 'src', 'tools')
const publicDir = join(__dirname, '..', 'public')

// 沒有設定 SITE_URL（例如本機測試）就用佔位網址，
// 跟 vite.config.js 裡的 PLACEHOLDER_SITE 是同一個字串，部署時才會被自動換掉。
const SITE_URL = (process.env.SITE_URL || 'https://your-username.github.io/toolbox').replace(/\/$/, '')

const toolIds = readdirSync(toolsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const urls = [`${SITE_URL}/`, ...toolIds.map((id) => `${SITE_URL}/tools/${id}`)]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

writeFileSync(join(publicDir, 'sitemap.xml'), sitemap)
writeFileSync(join(publicDir, 'robots.txt'), robots)

console.log(`已產生 sitemap.xml（${urls.length} 個網址）與 robots.txt，網域：${SITE_URL}`)
