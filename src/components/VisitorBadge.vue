<script setup>
import { computed } from 'vue'

// 用目前頁面的網址當作計數器的識別碼，
// 部署到 GitHub Pages 後不用手動填自己的網址，瀏覽器會自己算出來。
const badgeSrc = computed(() => {
  const pageUrl = window.location.origin + window.location.pathname
  const params = new URLSearchParams({
    url: pageUrl,
    title: '', // 不顯示標題文字，只留數字，畫面上更小一塊
    count_bg: '#8C7D5C',
    title_bg: '#8C7D5C',
    icon_color: '#FBFAF6',
    edge_flat: 'true',
  })
  return `https://hits.seeyoufarm.com/api/count/incr/badge.svg?${params.toString()}`
})
</script>

<template>
  <p class="tag">
    <span class="label">造訪次數</span>
    <img class="badge" :src="badgeSrc" alt="造訪次數統計" />
  </p>
</template>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  opacity: 0.55;
  transition: opacity 0.15s ease;
}
.tag:hover {
  opacity: 1;
}
.label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: var(--ink-soft);
}
.badge {
  height: 13px;
  width: auto;
  border-radius: 2px;
  vertical-align: middle;
  filter: grayscale(35%);
}
</style>
