<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useFileStore } from "../store/fileStore";
import type { FileInfo } from "../types";

const fileStore = useFileStore();
const listContainer = ref<HTMLElement>();

const onFileSelect = (file: FileInfo) => {
  fileStore.setSelectedFile(file);
};

const handleScroll = () => {
  if (!listContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = listContainer.value;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    fileStore.loadItems();
  }
};

onMounted(() => {
  listContainer.value?.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  listContainer.value?.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <section class="list-view">
    <div class="header">
      <h3>文件列表</h3>
      <span class="detail-info">{{ fileStore.filterListFiles.length }} 個文件</span>
    </div>
    <div ref="listContainer" class="file-list">
      <template v-if="fileStore.visibleItems.length !== 0">
        <div v-for="file in fileStore.visibleItems" :key="file.info.name" class="file-item" :class="{ active: fileStore.selectedFile?.name === file.info.name }" @click="onFileSelect(file.info)">
          <div class="file-name" :class="file.label">{{ file.info.name }}</div>
          <div class="file-info">起始位置: {{ file.info.start }} | 大小: {{ file.info.offset }}</div>
        </div>
      </template>
      <div v-if="fileStore.isLoading" class="loading">載入中...</div>
      <p v-else-if="fileStore.filterListFiles.length === 0" class="no-files">沒有可用的文件</p>
    </div>
  </section>
</template>

<style scoped>
.file-item {
  & {
    padding: 0.75rem 1rem;
    border: 2px solid transparent;
    border-radius: 10px;
    background: var(--bg-primary);
  }

  &:hover {
    background: var(--bg-hover);
    border-color: var(--accent-color-light);
    transform: translateX(6px);
    box-shadow: var(--shadow-md);
    cursor: pointer;
  }

  &.active {
    background: var(--accent-bg);
    border-color: var(--accent-color);
    box-shadow: var(--shadow-accent);
  }
}

.file-name {
  & {
    margin-bottom: 0.3rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--text-primary);
    overflow: hidden;
  }

  &.delete {
    color: #d00;
  }

  &.add {
    color: #0a0;
  }

  &.modify {
    color: #c90;
  }

  &.normal {
    color: #fff;
  }
}

.file-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.loading {
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
}
</style>
