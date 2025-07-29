<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { versions } from "./config/versions";
import type { countryCode } from "./types/index";

import Manger from "./components/Manger.vue";
import { applyTheme } from "./utils/theme";

onMounted(() => {
  // const isDarked = localStorage.getItem("isDark");
  // if (isDarked) {
  //   const theme = JSON.parse(isDarked);
  //   isDark.value = JSON.parse(theme);

  //   applyTheme(theme);
  //   return;
  // }
  applyTheme(true);
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
const countryVersions = computed(() => {
  if (!selectedCC.value) return [];
  return versions[selectedCC.value]?.length > 0 ? versions[selectedCC.value] : [null];
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  // applyTheme(isDark.value);
};
</script>

<template>
  <header class="header">
    <div>
      <div class="select-wrapper">
        <label>選擇版本：</label>
        <select v-model="selectedCC" @change="selectedVersion = null">
          <option v-for="(label, code) in countryMap" :key="code" :value="code">
            {{ label }}
          </option>
        </select>
        <select v-if="selectedCC" v-model="selectedVersion">
          <option v-for="version in countryVersions" :key="version || 'none'" :value="version">
            {{ version !== null ? version : "無版本可以選擇" }}
          </option>
        </select>
        <select v-else></select>
      </div>
    </div>
    <div class="theme-toggle" @click="toggleTheme">
      <i v-if="!isDark" class="bi bi-sun-fill" style="font-size: 24px"></i>
      <i v-if="isDark" class="bi bi-moon-fill" style="font-size: 24px"></i>
    </div>
  </header>

  <main class="main-content">
    <Manger v-if="selectedCC && selectedVersion" :cc="selectedCC" :version="selectedVersion" />
    <div v-else class="welcome">
      <p>選擇檔案</p>
    </div>
  </main>
</template>

<style scoped>
.header {
  padding: 15px 32px;
  box-shadow: 0 2px 4px var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 70px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  overflow: hidden;
}

.welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: var(--welcome-text);
  font-size: 20px;
}

/*
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
*/
</style>
