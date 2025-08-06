<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";

import { versions } from "../config/versions";

import Manger from "../components/Manger.vue";

import { applyTheme } from "../utils/theme";
import { useFileStore } from "../store/fileStore";
import { initDataByQuery } from "../utils/routeController";

onMounted(() => {
  const storage = localStorage.getItem("isDark");
  if (storage) {
    const theme = JSON.parse(storage);
    isDark.value = theme;
    applyTheme(theme);
  } else {
    applyTheme(false);
  }
});

onMounted(() => {
  initDataByQuery();
});

const isDark = ref(false);
provide("isDark", isDark);

const fileStore = useFileStore();

const countryMap = {
  JP: "日文版",
  TW: "中文版",
  EN: "國際版",
  KR: "韓文版",
} as const;

const selectedCC = computed(() => fileStore.selectedCC);

const countryVersions = computed(() => {
  if (!selectedCC.value) return [];
  return versions[selectedCC.value]?.length > 0 ? versions[selectedCC.value] : [null];
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  applyTheme(isDark.value);
};
</script>

<template>
  <header class="header">
    <div>
      <div class="select-wrapper">
        <label>選擇版本：</label>
        <select v-model="fileStore.selectedCC">
          <option v-for="(label, code) in countryMap" :key="code" :value="code">
            {{ label }}
          </option>
        </select>
        <select v-if="selectedCC" v-model="fileStore.selectedVersion">
          <option v-for="version in countryVersions" :key="version || 'none'" :value="version">
            {{ version !== null ? version : "無版本可以選擇" }}
          </option>
        </select>
        <select v-else></select>
        <select v-if="selectedCC" v-model="fileStore.selectedComparedVersion">
          <option v-for="version in countryVersions" :key="version || 'none'" :value="version">
            {{ version !== null ? version : "無版本可以選擇" }}
          </option>
        </select>
        <select v-else></select>
      </div>
    </div>
    <div class="theme-toggle" @click="toggleTheme">
      <i :class="isDark ? 'bi bi-moon-fill' : 'bi bi-sun-fill'" style="font-size: 24px"></i>
    </div>
  </header>

  <main class="main-content">
    <Manger v-if="selectedCC && fileStore.selectedVersion" />
    <p v-else class="welcome">選擇檔案</p>
  </main>
</template>

<style scoped>
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
</style>
