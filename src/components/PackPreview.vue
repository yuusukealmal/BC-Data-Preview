<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";

import type { ImageInfo, PreviewImage } from "../types";
import { useFileStore } from "../store/fileStore";
import { getData } from "../utils/crypto/decrypt";
import { createImage } from "../utils/imageCreate";

import ImagePreview from "./ImagePreview.vue";
import CodeBlock from "./CodeBlock.vue";

onUnmounted(() => {
  if (previewImage.value.url) {
    URL.revokeObjectURL(previewImage.value.url);
  }
  if (comparedImage.value.url) {
    URL.revokeObjectURL(comparedImage.value.url);
  }
});

const previewContent = ref<string | null>(null);
const previewImage = ref<PreviewImage>({
  url: null,
  info: {
    width: 0,
    height: 0,
    size: 0,
  },
});
const comparedImage = ref<PreviewImage>({
  url: null,
  info: {
    width: 0,
    height: 0,
    size: 0,
  },
});

const fileStore = useFileStore();
const fileInfo = computed(() => fileStore.selectedFile);

const decrypt = () => {
  if (previewImage.value.url) {
    URL.revokeObjectURL(previewImage.value.url);
    previewImage.value.url = null;
  }
  if (comparedImage.value.url) {
    URL.revokeObjectURL(comparedImage.value.url);
    comparedImage.value.url = null;
  }

  if (!fileStore.packBuffer) {
    console.warn("Pack data not available");
    previewContent.value = "Pack 數據未載入";
    return;
  }

  try {
    const result = getData();

    if (result.type === "image") {
      const data = result.data.data as ArrayBuffer;
      const comparedData = result.data.comparedData as ArrayBuffer;

      createImage(data, previewImage);
      if (!result.same) {
        createImage(comparedData, comparedImage);
      }

      previewContent.value = null;
    } else {
      const data = result.data.data as string;
      const extension = fileStore.selectedFile!.name!.split(".").pop();

      previewContent.value = ["json", "preset"].includes(extension!) ? JSON.stringify(JSON.parse(data), null, 2) : data;
      previewImage.value.url = null;
      comparedImage.value.url = null;
    }
  } catch (error) {
    console.error("Error decrypting file:", error);
    previewContent.value = "解密文件時發生錯誤";
  }
};

const copyToClipboard = async () => {
  const file = fileInfo.value;
  const extension = file?.name.split(".").pop();

  if (extension === "png") {
    if (!previewImage.value.url) return;

    const response = await fetch(previewImage.value.url);
    const blob = await response.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  } else {
    await navigator.clipboard.writeText(`
\`\`\`${extension}
${previewContent.value}
\`\`\`
      `);
  }
};

const downloadFile = async () => {
  const file = fileInfo.value;
  const extension = file?.name.split(".").pop();

  const a = document.createElement("a");

  if (extension === "png") {
    if (!previewImage.value.url) return;

    const response = await fetch(previewImage.value.url);
    const blob = await response.blob();
    a.href = URL.createObjectURL(blob);
  } else {
    a.href = URL.createObjectURL(new Blob([previewContent.value!], { type: `text/${extension}` }));
  }

  a.download = file!.name;
  a.click();
  URL.revokeObjectURL(a.href);
};

watch(fileInfo, decrypt);
</script>

<template>
  <section class="pack-view">
    <div class="header">
      <h3>文件預覽</h3>
      <div v-if="fileInfo" class="detail-info">
        <i class="bi bi-clipboard-fill copy-icon" @click="copyToClipboard">複製</i>
        <i class="bi bi-download download-icon" @click="downloadFile">下載</i>
        <span>當前選擇: {{ fileInfo.name }}</span>
      </div>
    </div>
    <div class="preview-content">
      <div v-if="fileInfo" class="preview">
        <ImagePreview v-if="previewImage.url || comparedImage.url" :previewImage="previewImage" :comparedPreviewImage="comparedImage" />
        <CodeBlock v-else :code="previewContent!" />
      </div>
      <p v-else class="no-files">未選擇文件</p>
    </div>
  </section>
</template>

<style scoped>
.preview {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
