<script setup lang="ts">
import { ref, type PropType, watch } from "vue";

import { type CountryCode, type FileType, type FileInfo, FILE_TYPE_LIST } from "../types/index";

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
  comparedVersion: {
    type: String,
  },
});

const selectedFileType = ref<FileType>(FILE_TYPE_LIST[0]);
const keyWordValue = ref<string>("");
const selectedFile = ref<FileInfo>();

const listBuffer = ref<ArrayBuffer>();
const packBuffer = ref<ArrayBuffer>();
const comparedListBuffer = ref<ArrayBuffer>();
const comparedPackBuffer = ref<ArrayBuffer>();

const loadData = async () => {
  const fileBase = `/${props.cc}/${props.version}/${selectedFileType.value}`;
  const comparedFileBase = `/${props.cc}/${props.comparedVersion}/${selectedFileType.value}`;

  const listFile = await fetch(`${fileBase}.list`);
  const packFile = await fetch(`${fileBase}.pack`);
  const comparedListFile = await fetch(`${comparedFileBase}.list`);
  const comparedPackFile = await fetch(`${comparedFileBase}.pack`);

  listBuffer.value = await listFile.arrayBuffer();
  packBuffer.value = await packFile.arrayBuffer();
  comparedListBuffer.value = await comparedListFile.arrayBuffer();
  comparedPackBuffer.value = await comparedPackFile.arrayBuffer();
};

watch([selectedFileType, () => props.cc, () => props.version, () => props.comparedVersion], loadData, { immediate: true });
</script>

<template>
  <fileTypeSelector v-model:selectedFileType="selectedFileType" v-model:keyWord="keyWordValue" />

  <div class="wrapper">
    <FileList v-model:selectedFileInfo="selectedFile" :list-buffer="listBuffer" :comparedListBuffer="comparedListBuffer" :key-word="keyWordValue" class="list-view" />
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
