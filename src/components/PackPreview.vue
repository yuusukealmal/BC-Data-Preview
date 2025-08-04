<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";

import type { ImageInfo } from "../types";
import { useFileStore } from "../store/fileStore";
import { getData } from "../utils/crypto/decrypt";
import CodeBlock from "./CodeBlock.vue";
import { createImage } from "../utils/imageCreate";

onUnmounted(() => {
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value);
  }
  if (comparedPreviewImageUrl.value) {
    URL.revokeObjectURL(comparedPreviewImageUrl.value);
  }
});

const previewContent = ref<string | null>(null);
const previewImageUrl = ref<string | null>(null);
const imageInfo = ref<ImageInfo>({
  width: 0,
  height: 0,
  size: 0,
});
const comparedPreviewImageUrl = ref<string | null>(null);
const comparedImageInfo = ref<ImageInfo>({
  width: 0,
  height: 0,
  size: 0,
});

const fileStore = useFileStore();
const fileInfo = computed(() => fileStore.selectedFile);

const decrypt = () => {
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value);
    previewImageUrl.value = null;
  }
  if (comparedPreviewImageUrl.value) {
    URL.revokeObjectURL(comparedPreviewImageUrl.value);
    comparedPreviewImageUrl.value = null;
  }

  if (!fileStore.packBuffer) {
    console.warn("Pack data not available");
    previewContent.value = "Pack 數據未載入";
    return;
  }

  try {
    const result = getData();
    console.log(result);

    if (result.type === "image") {
      const data = result.data.data as ArrayBuffer;
      const comparedData = result.data.comparedData as ArrayBuffer;

      createImage(data, previewImageUrl, comparedImageInfo);
      if (!result.same) {
        createImage(comparedData, comparedPreviewImageUrl, imageInfo);
      }

      previewContent.value = null;
    } else {
      const data = result.data.data as string;

      previewContent.value = ["json", "preset"].includes(fileStore.selectedFile?.name!) ? JSON.stringify(JSON.parse(data), null, 2) : data;
      previewImageUrl.value = null;
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
    if (!previewImageUrl.value) return;

    const response = await fetch(previewImageUrl.value);
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
    if (!previewImageUrl.value) return;

    const response = await fetch(previewImageUrl.value);
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
        <div v-if="previewImageUrl || comparedPreviewImageUrl" class="image-wrapper">
          <div v-if="previewImageUrl">
            <img :src="previewImageUrl" :alt="fileInfo.name" />
            <span>W: {{ imageInfo.width }}px | H: {{ imageInfo.height }}px | Size: {{ imageInfo.size }} Kib</span>
          </div>
          <div v-if="comparedPreviewImageUrl">
            <img :src="comparedPreviewImageUrl" :alt="fileInfo.name" />
            <span>W: {{ comparedImageInfo.width }}px | H: {{ comparedImageInfo.height }}px | Size: {{ comparedImageInfo.size }} Kib</span>
          </div>
        </div>
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

.image-wrapper {
  & {
    height: 100%;
    display: flex;
    overflow: hidden;
  }

  div {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  span {
    margin-top: 0.5em;
    opacity: 0.3;
  }

  img {
    border: 1px solid rgba(255, 0, 0, 0.5);
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}
</style>
