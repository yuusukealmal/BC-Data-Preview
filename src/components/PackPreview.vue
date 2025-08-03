<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";

import type { ImageInfo } from "../types";
import { useFileStore } from "../sotre/fileStore";
import { aesCBCDecrypt } from "../utils/crypto/decrypt";
import CodeBlock from "./CodeBlock.vue";

onUnmounted(() => {
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value);
  }
});

const previewContent = ref<string | null>(null);
const previewImageUrl = ref<string | null>(null);
const imageInfo = ref<ImageInfo>({
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

  if (!fileStore.packBuffer) {
    console.warn("Pack data not available");
    previewContent.value = "Pack 數據未載入";
    return;
  }

  try {
    const data = aesCBCDecrypt();
    const format = fileInfo.value!.name.split(".").pop()!;

    if (format === "png") {
      const blob = new Blob([data], { type: "image/png" });
      previewImageUrl.value = URL.createObjectURL(blob);
      previewContent.value = null;

      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        imageInfo.value = {
          width: img.width,
          height: img.height,
          size: Math.round(((data as ArrayBuffer).byteLength / 1024) * 100) / 100,
        };
      };
    } else {
      previewContent.value = ["json", "preset"].includes(format) ? JSON.stringify(JSON.parse(data as string), null, 2) : (data as string);
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
        <div v-if="previewImageUrl" class="image-preview">
          <img :src="previewImageUrl" :alt="fileInfo.name" />
          <span class="image-info">W: {{ imageInfo.width }}px | H: {{ imageInfo.height }}px | Size: {{ imageInfo.size }} Kib</span>
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

.image-preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.image-info {
  margin-top: 0.5em;
  opacity: 0.3;
  flex-direction: column;
  justify-content: center;
}
</style>
