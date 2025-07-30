<script setup lang="ts">
import { computed, ref, watch, type PropType } from "vue";
import type { FileInfo, List } from "../types";
import { aesECBDecrypt } from "../utils/crypto/decrypt";

const props = defineProps({
  listBuffer: {
    type: ArrayBuffer,
  },
  keyWord: {
    type: String,
    required: true,
  },
  selectedFileInfo: {
    type: Object as PropType<FileInfo>,
  },
});

const emit = defineEmits(["update:selectedFileInfo"]);

const list = ref<List | null>(null);
const selectedFile = ref<string | null>(null);

const decrypt = async () => {
  if (!props.listBuffer) return;

  const listResult = aesECBDecrypt(props.listBuffer);
  list.value = {
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
};
const filterListFiles = computed(() => {
  if (!props.keyWord) {
    return list.value?.files || [null];
  }
  return list.value?.files?.filter((file) => file.name.includes(props.keyWord)) || [null];
});

const onFileSelect = (file: FileInfo) => {
  selectedFile.value = file.name;
  emit("update:selectedFileInfo", file);
};

watch(() => props.listBuffer, decrypt, { immediate: true });
</script>

<template>
  <section class="list-view">
    <div class="header">
      <h3>文件列表</h3>
      <span class="detail-info">{{ filterListFiles.length }} 個文件</span>
    </div>
    <div class="file-list">
      <div v-for="file in filterListFiles" :key="file?.name" class="file-item" :class="{ active: selectedFile === file?.name }" @click="onFileSelect(file!)">
        <div v-if="file === null" class="no-files">
          <p>沒有可用的文件</p>
        </div>
        <div v-else>
          <div class="file-name">{{ file.name }}</div>
          <div class="file-info">起始位置: {{ file.start }} | 大小: {{ file.offset }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.file-item {
  padding: 0.75rem 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  background: var(--bg-primary);
}

.file-item:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color-light);
  transform: translateX(6px);
  box-shadow: var(--shadow-md);
}

.file-item.active {
  background: var(--accent-bg);
  border-color: var(--accent-color);
  box-shadow: var(--shadow-accent);
}

.file-name {
  margin-bottom: 0.3rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-primary);
  overflow: hidden;
}

.file-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
