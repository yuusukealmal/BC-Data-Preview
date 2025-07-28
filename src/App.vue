<script setup lang="ts">
import { onMounted, ref } from "vue";

import { versions } from "./config/versions";
import type { countryCode } from "./types/index";

import Manger from "./components/Manger.vue";
import { applyTheme } from "./utils/theme";

onMounted(() => {
  const isDarked = localStorage.getItem("isDark");
  if (isDarked) {
    const theme = JSON.parse(isDarked);
    isDark.value = JSON.parse(theme);

    applyTheme(theme);
    return;
  }
  applyTheme(false);
});

const selectedCC = ref<countryCode | null>(null);
const selectedVersion = ref<string | null>(null);
const isDark = ref(false);

const countryMap = {
  JP: "日文版",
  TW: "中文版",
  EN: "國際版",
  KR: "韓文版",
} as const;

const toggleTheme = () => {
  // isDark.value = !isDark.value;
  // applyTheme(isDark.value);
};
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="input-controls">
        <div class="dropdown-wrapper">
          <label for="cc-select">選擇版本：</label>
          <select id="cc-select" v-model="selectedCC" @change="selectedVersion = null">
            <option v-for="(label, code) in countryMap" :key="code" :value="code">
              {{ label }}
            </option>
          </select>
          <select v-if="selectedCC" id="version-select" v-model="selectedVersion">
            <option v-if="versions[selectedCC].length > 0" v-for="version in versions[selectedCC]" :key="version" :value="version">
              {{ version }}
            </option>
            <option v-else value="null">無版本可以選擇</option>
          </select>
          <select v-else></select>
        </div>
      </div>
      <div class="theme-switch" @click="toggleTheme">
        <i v-if="!isDark" class="bi bi-sun-fill" style="font-size: 24px"></i>
        <i v-if="isDark" class="bi bi-moon-fill" style="font-size: 24px"></i>
      </div>
    </header>

    <main class="main-content">
      <div v-if="selectedCC && selectedVersion">
        <Manger :cc="selectedCC" :version="selectedVersion" />
      </div>
      <div v-else class="welcome">
        <p>選擇檔案</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
i {
  transition: transform 0.3s ease, color 0.2s ease, opacity 0.25s ease;
  cursor: pointer;
  color: var(--text-primary);
}

i:hover {
  transform: rotate(15deg) scale(1.2);
  color: #28a745;
  opacity: 0.8;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.header {
  background: var(--header-bg);
  padding: 20px 32px;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 28px;
}

.input-controls {
  display: flex;
  gap: 32px;
}

.dropdown-wrapper label {
  font-weight: 500;
  color: var(--text-primary);
  min-width: 90px;
  font-size: 16px;
}

.dropdown-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dropdown-wrapper select {
  padding: 8px 12px;
  border: 1px solid var(--border-input);
  border-radius: 8px;
  background: var(--bg-primary);
  font-size: 14px;
  color: var(--text-primary);
  min-width: 150px;
  transition: all 0.3s ease;
}

.dropdown-wrapper select:focus {
  outline: none;
  border-color: var(--focus-color);
  box-shadow: 0 0 0 3px var(--focus-shadow);
}

.theme-switch {
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-switch:hover {
  background-color: var(--border-color);
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--welcome-text);
  font-size: 20px;
}
</style>
