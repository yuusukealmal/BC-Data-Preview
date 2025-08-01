<script setup lang="ts">
import { computed, ref, watch, type PropType } from "vue";
import type { FileInfo, List } from "../types";
import { aesECBDecrypt } from "../utils/crypto/decrypt";
import * as CryptoJS from "crypto-js";

const props = defineProps({
  listBuffer: {
    type: ArrayBuffer,
  },
  comparedListBuffer: {
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

type LabeledFile = {
  info: FileInfo;
  label: "normal" | "delete" | "add" | "modify";
};

const list = ref<List | null>(null);
const comparedList = ref<List | null>(null);
const mergedList = ref<LabeledFile[]>([]);
const selectedFileName = ref<string | null>(null);

const decryptList = async () => {
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

const decryptComparedList = async () => {
  if (!props.comparedListBuffer) return;

  const listResult = aesECBDecrypt(props.comparedListBuffer);
  comparedList.value = {
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
    return mergedList.value;
  }
  return mergedList.value?.filter((file) => file.info.name.includes(props.keyWord)) || [];
});

const onFileSelect = (file: FileInfo) => {
  selectedFileName.value = file.name;
  emit("update:selectedFileInfo", file);
};

const mergeList = async () => {
  const aMap = new Map<string, FileInfo>();
  const bMap = new Map<string, FileInfo>();

  for (const item of list.value?.files || []) aMap.set(item.name, item);
  for (const item of comparedList.value?.files || []) bMap.set(item.name, item);

  const allHashes = new Set([...aMap.keys(), ...bMap.keys()]);

  mergedList.value = [];
  for (const hash of allHashes) {
    const aItem = aMap.get(hash);
    const bItem = bMap.get(hash);

    if (aItem && bItem) {
      mergedList.value.push({ info: aItem, label: "normal" });
    } else if (aItem) {
      mergedList.value.push({ info: aItem, label: "delete" });
    } else if (bItem) {
      mergedList.value.push({ info: bItem, label: "add" });
    }
  }
};

watch(() => props.listBuffer, decryptList, { immediate: true });
watch(() => props.comparedListBuffer, decryptComparedList, { immediate: true });
watch([list, comparedList], mergeList, { immediate: true });
</script>

<template>
  <section class="list-view">
    <div class="header">
      <h3>文件列表</h3>
      <span class="detail-info">{{ filterListFiles.length }} 個文件</span>
    </div>
    <div class="file-list">
      <template v-if="filterListFiles.length !== 0">
        <div v-for="file in filterListFiles" :key="file.info.name" class="file-item" :class="{ active: selectedFileName === file.info.name }" @click="onFileSelect(file.info)">
          <div class="file-name" :class="[file.label]">{{ file.info.name }}</div>
          <div class="file-info">起始位置: {{ file.info.start }} | 大小: {{ file.info.offset }}</div>
        </div>
      </template>
      <p v-else class="no-files">沒有可用的文件</p>
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
</style>
