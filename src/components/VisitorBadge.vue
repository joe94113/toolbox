<script setup>
// 計數服務用 komarev（seeyoufarm 的 API 已停擺，改用這個）。
// 它用一個固定字串當識別碼，所以這裡寫死一個專屬 key；label 留空只顯示數字，
// 畫面上就是一小塊數字膠囊，跟旁邊的「造訪次數」小標搭配。
const params = new URLSearchParams({
  username: 'joe94113-toolbox',
  label: '', // 不顯示標題文字，只留數字
  style: 'flat',
  color: '8C7D5C',
})
const badgeSrc = `https://komarev.com/ghpvc/?${params.toString()}`
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
