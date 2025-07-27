<script setup lang="ts">
import { ref } from "vue";

import { versions } from "./config/versions";
import type { countryCode } from "./types/index";

import Manger from "./components/Manger.vue";

const selectedCC = ref<countryCode | null>(null);
const selectedVersion = ref<string | null>(null);

const countryMap = {
  JP: "日文版",
  TW: "中文版",
  EN: "國際版",
  KR: "韓文版",
} as const;
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
          <select v-if="selectedCC" id="cc-select" v-model="selectedVersion">
            <option v-for="version in versions[selectedCC]" :key="version" :value="version">
              {{ version }}
            </option>
          </select>
        </div>
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
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.header {
  background: white;
  padding: 20px 32px;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.input-controls {
  display: flex;
  gap: 32px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-group label {
  font-weight: 500;
  color: #495057;
  min-width: 90px;
  font-size: 16px;
}

.input-group input {
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  background: white;
  min-width: 250px;
  font-size: 14px;
}

.input-group input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.dropdown-wrapper label {
  font-weight: 500;
  color: #495057;
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
  border: 1px solid #ced4da;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #495057;
  min-width: 150px;
}

.dropdown-wrapper select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
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
  color: #6c757d;
  font-size: 20px;
}
</style>
