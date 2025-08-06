<script setup lang="ts"></script>

<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">找不到頁面</p>
      <p class="error-hint">您可能輸入了錯誤的網址，或頁面已被移除。</p>
      <router-link to="/" class="back-home">返回首頁</router-link>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  text-align: center;
  padding: 32px;
}

.error-content {
  max-width: 500px;
}

.error-code {
  font-size: 72px;
  font-weight: bold;
  color: var(--text-secondary);
  margin-bottom: 16px;
  opacity: 0.6;
}

.error-message {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.error-hint {
  font-size: 16px;
  margin-bottom: 24px;
  color: var(--text-secondary);
  opacity: 0.8;
}

.back-home {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--focus-color);
  color: var(--bg-primary);
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s, opacity 0.3s;
  font-weight: 500;
}

.back-home:hover {
  opacity: 0.8;
  box-shadow: 0 0 0 3px var(--focus-shadow);
}
</style>
