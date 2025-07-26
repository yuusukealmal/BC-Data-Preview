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
.manager {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sidebar {
  width: 50%;
  border-right: 2px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  justify-content: space-between;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.preview-body {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
}

.file-count {
  background: #e9ecef;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  color: #6c757d;
}

.file-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 0.5rem;
}

.file-item {
  padding: 16px;
  padding: 0.75rem 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: #f5f5f5;
  border-color: #cce7ff;
  transform: translateX(6px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.file-item.active {
  background-color: #d0f0ff;
  font-weight: bold;
  border-color: #2196f3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.file-name {
  font-size: 1rem;
  margin-bottom: 0.2rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
}

.file-info {
  font-size: 0.875rem;
  color: #888;
}

.preview-section {
  width: 50%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 24px;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.selected-info {
  background: #e8f5e8;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #2e7d32;
  font-weight: 500;
}

.preview-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  display: flex;
  color: black;
  justify-content: start;
  align-items: start;
}

.image-preview {
  justify-content: center;
  align-items: center;
}

.preview-body {
  padding: 24px;
  border-radius: 10px;
  min-height: 300px;
  font-size: 14px;
  line-height: 1.6;
  border: 2px solid #e9ecef;
}
</style>
