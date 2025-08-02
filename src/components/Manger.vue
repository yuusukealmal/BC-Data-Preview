<script setup lang="ts">
import { watch, type PropType } from "vue";

import { useFileStore } from "../sotre/fileStore";
import { type CountryCode, FILE_TYPE_LIST } from "../types/index";

import fileTypeSelector from "./fileTypeSelector.vue";
import FileList from "./FileList.vue";
import PackPreview from "./PackPreview.vue";
</script>

<template>
  <fileTypeSelector />

  <div class="wrapper">
    <FileList class="list-view" />
    <PackPreview class="pack-view" />
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
