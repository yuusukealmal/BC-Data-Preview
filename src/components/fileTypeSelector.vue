<script setup lang="ts">
import { FILE_STATUS, FILE_TYPE_LIST } from "../types";
import { useFileStore } from "../sotre/fileStore";

const fileStore = useFileStore();
</script>

<template>
  <div class="file-type-selector select-wrapper">
    <span>文件類型：</span>
    <select v-model="fileStore.selectedFileType">
      <option v-for="fileType in FILE_TYPE_LIST" :key="fileType" :value="fileType">
        {{ fileType }}
      </option>
    </select>
    <span>篩選: </span>
    <input v-model="fileStore.keyWordValue" type="text" />
    <select v-model="fileStore.selectedDiffType">
      <option v-for="diffType in FILE_STATUS" :key="diffType" :value="diffType">
        {{ diffType }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.file-type-selector {
  padding: 12px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
