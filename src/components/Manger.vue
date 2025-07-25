<script setup lang="ts">
import { ref, type PropType } from "vue";
import type { List } from "../types";
import { aesCBCDecrypt } from "../utils/crypto/decrypt";

const props = defineProps({
  list: {
    type: Object as PropType<List>,
    required: true,
  },
  pack: {
    type: ArrayBuffer as PropType<ArrayBuffer>,
    required: true,
  },
});

const selectedFile = ref<string | null>(null);
const previewContent = ref<string>("");
const previewImageUrl = ref<string | null>(null);
const isImage = ref<boolean>(false);

const selectFile = (idx: number) => {
  const file = props.list.files[idx];
  selectedFile.value = file.name;

  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value);
    previewImageUrl.value = null;
  }

  const data = aesCBCDecrypt("TW", file, props.pack);

  if (file.name.endsWith(".png")) {
    isImage.value = true;
    const blob = new Blob([data as Uint8Array], { type: "image/png" });
    previewImageUrl.value = URL.createObjectURL(blob);
    previewContent.value = "";
  } else {
    isImage.value = false;
    previewContent.value = data as string;
    previewImageUrl.value = null;
  }
};
</script>

<template>
  <div class="manager">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>文件列表</h3>
        <span class="file-count">{{ list.files.length }} 個文件</span>
      </div>
      <div class="file-list">
        <div v-for="(file, idx) in list.files" :key="file.name" class="file-item" :class="{ active: selectedFile === file.name }" @click="selectFile(idx)">
          <div>
            <div class="file-name">{{ file.name }}</div>
            <div class="file-info">起始位置: {{ file.start }} | 大小: {{ file.offset }}</div>
          </div>
        </div>
      </div>
    </aside>

    <section class="preview-section">
      <div class="preview-header">
        <h3>文件預覽</h3>
        <div v-if="selectedFile" class="selected-info">當前選擇: {{ selectedFile }}</div>
      </div>
      <div class="preview-content">
        <div v-if="selectedFile" class="preview">
          <div class="preview-body">
            <div v-if="isImage && previewImageUrl" class="image-preview">
              <img :src="previewImageUrl" :alt="selectedFile" />
            </div>
            <div v-else-if="!isImage">
              <pre>{{ previewContent }}</pre>
            </div>
          </div>
        </div>
        <div v-else>
          <p>未選擇文件</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
