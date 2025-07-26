<script setup lang="ts">
import { ref, type PropType } from "vue";
import type { countryCode, List } from "../types/index";
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
  cc: {
    type: String as PropType<countryCode>,
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

  console.log("Selected CC:", props.cc);
  const data = aesCBCDecrypt(props.cc, file, props.pack);

  if (file.name.endsWith(".png")) {
    isImage.value = true;
    const blob = new Blob([data], { type: "image/png" });
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

<style scoped>
.preview-body {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
}

.file-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 0.5rem;
}

.file-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.file-item.active {
  background-color: #d0f0ff;
  font-weight: bold;
}

.file-name {
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.file-info {
  font-size: 0.875rem;
  color: #888;
}
</style>
