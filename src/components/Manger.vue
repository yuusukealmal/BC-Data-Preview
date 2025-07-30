<script setup lang="ts">
import { ref, type PropType, watch, computed } from "vue";

import { type CountryCode, type List, type FileType, type FileInfo, type ImageInfo, FILE_TYPE_LIST } from "../types/index";
import { aesCBCDecrypt, aesECBDecrypt } from "../utils/crypto/decrypt";

import fileTypeSelector from "./fileTypeSelector.vue";
import FileList from "./FileList.vue";
import PackPreview from "./PackPreview.vue";

const props = defineProps({
  cc: {
    type: String as PropType<CountryCode>,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
});

const selectedFileType = ref<FileType>(FILE_TYPE_LIST[0]);
const keyWordValue = ref<string>("");
const selectedFile = ref<FileInfo>();

const listBuffer = ref<ArrayBuffer>();
const packBuffer = ref<ArrayBuffer>();

const loadData = async () => {
  const fileBase = `/${props.cc}/${props.version}/${selectedFileType.value}`;

  const listFile = await fetch(`${fileBase}.list`);
  const packFile = await fetch(`${fileBase}.pack`);

  listBuffer.value = await listFile.arrayBuffer();
  packBuffer.value = await packFile.arrayBuffer();
};

watch([selectedFileType, () => props.cc, () => props.version], loadData, { immediate: true });
</script>

<template>
  <fileTypeSelector v-model:selectedFileType="selectedFileType" v-model:keyWord="keyWordValue" />

  <div class="wrapper">
    <FileList :list-buffer="listBuffer" :key-word="keyWordValue" v-model:selectedFileInfo="selectedFile" class="list-view" />
    <PackPreview class="pack-view" :packBuffer="packBuffer" :file-info="selectedFile" :cc="cc" :folder="selectedFileType" />
  </div>
</template>

<style scoped>
.wrapper {
  flex: 1;
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--bg-primary);
}

.list-view {
  flex: 1;
}

.pack-view {
  flex: 2;
}

/*
@media (max-width: 768px) {
  .manager {
    flex-direction: column;
  }

  .sidebar,
  .preview-section {
    width: 100%;
  }

  .sidebar {
    border-right: none;
    border-bottom: 2px solid var(--border-color);
  }
}
*/
</style>
