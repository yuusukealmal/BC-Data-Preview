<script setup lang="ts">
import { ref } from "vue";

import type { List } from "./types/index";
import { aesECBDecrypt } from "./utils/crypto/decrypt";

import Manger from "./components/Manger.vue";

const list = ref<List | null>(null);
const pack = ref<ArrayBuffer | null>(null);

const handleInputChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) {
    return;
  }

  if (file.name.endsWith(".list")) {
    const listResult = aesECBDecrypt(await file.arrayBuffer());

    list.value = {
      name: file.name.split(".")[0],
      files: listResult
        .split("\n")
        .slice(1, -1)
        .map((item) => {
          const [name, start, offset] = item.split(",");
          return {
            name,
            start: Number(start),
            offset: Number(offset),
          };
        }),
    };
  } else if (file.name.endsWith(".pack")) {
    pack.value = await file.arrayBuffer();
  } else {
    alert("不支持的文件格式");
  }
};
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="input-controls">
        <div class="input-group">
          <label>List 文件</label>
          <input type="file" accept=".list" @change="handleInputChange($event)" />
        </div>
        <div class="input-group">
          <label>Pack 文件</label>
          <input type="file" accept=".pack" @change="handleInputChange($event)" />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="list && pack">
        <Manger :list="list" :pack="pack" />
        <Preview />
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
