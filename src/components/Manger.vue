<script setup lang="ts">
import { ref, type PropType, watch, computed } from "vue";

import type { countryCode, List, fileType, fileInfo, imageInfo } from "../types/index";
import { aesCBCDecrypt, aesECBDecrypt } from "../utils/crypto/decrypt";

import Code from "./Code.vue";

const props = defineProps({
  cc: {
    type: String as PropType<countryCode>,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
});

const FILE_TYPE_LIST: fileType[] = ["DataLocal", "DownloadLocal", "ImageDataLocal", "ImageLocal", "MapLocal", "NumberLocal", "resLocal", "UnitLocal"] as const;
const selectedFileType = ref<fileType>(FILE_TYPE_LIST[0]);
const list = ref<List | null>(null);
const pack = ref<ArrayBuffer | null>(null);
const keyWordValue = ref<string>("");
const selectedFile = ref<string | null>(null);
const previewContent = ref<string | null>(null);
const previewImageUrl = ref<string | null>(null);
const imageInfo = ref<imageInfo>({
  width: 0,
  height: 0,
  size: 0,
});

const filterListFiles = computed(() => {
  if (!keyWordValue.value) {
    return list.value?.files || [null];
  }
  return list.value?.files?.filter((file) => file.name.includes(keyWordValue.value)) || [null];
});

const loadData = async () => {
  if (!selectedFileType.value || !props.cc || !props.version) {
    list.value = null;
    return;
  }

  const fileBase = `/${props.cc}/${props.version}/${selectedFileType.value}`;
  const listFile = await fetch(`${fileBase}.list`);
  const packFile = await fetch(`${fileBase}.pack`);

  const listResult = aesECBDecrypt(await listFile.arrayBuffer());
  list.value = {
    files: listResult
      .split("\n")
      .slice(1, -1)
      .map((item) => {
        const [name, start, offset] = item.split(",");
        return {
          name,
          start: Number(start),
          offset: Number(offset),
        };
      }),
  };
  pack.value = await packFile.arrayBuffer();
};

const selectFile = (selected: fileInfo) => {
  if (!list.value || !list.value.files || list.value.files.length === 0) {
    console.warn("No files available");
    return;
  }

  selectedFile.value = selected.name;

  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value);
    previewImageUrl.value = null;
  }

  if (!pack.value) {
    console.warn("Pack data not available");
    previewContent.value = "Pack 數據未載入";
    return;
  }

  try {
    const data = aesCBCDecrypt(props.cc, selectedFileType.value, selected, pack.value);
    const format = selectedFile.value.split(".").pop();

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
      previewContent.value = format === "json" ? JSON.stringify(JSON.parse(data as string), null, 2) : (data as string);
      previewImageUrl.value = null;
    }
  } catch (error) {
    console.error("Error decrypting file:", error);
    previewContent.value = "解密文件時發生錯誤";
  }
};

const copyToClipboard = async () => {
  const file = selectedFile.value!;
  const extension = file.split(".").pop();

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
  const file = selectedFile.value!;
  const extension = file.split(".").pop();

  const a = document.createElement("a");

  if (extension === "png") {
    if (!previewImageUrl.value) return;

    const response = await fetch(previewImageUrl.value);
    const blob = await response.blob();
    a.href = URL.createObjectURL(blob);
  } else {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([previewContent.value!], { type: `text/${extension}` }));
  }

  a.download = file;
  a.click();
  URL.revokeObjectURL(a.href);
};

watch([selectedFileType, () => props.cc, () => props.version], loadData, { immediate: true });
</script>

<template>
  <div class="file-type-selector select-wrapper">
    <span>文件類型：</span>
    <select v-model="selectedFileType">
      <option v-for="fileType in FILE_TYPE_LIST" :key="fileType" :value="fileType">
        {{ fileType }}
      </option>
    </select>
    <span>篩選: </span>
    <input v-model="keyWordValue" type="text" />
  </div>

  <div class="wrapper">
    <section class="list-view">
      <div class="header">
        <h3>文件列表</h3>
        <span class="detail-info">{{ filterListFiles.length }} 個文件</span>
      </div>
      <div class="file-list">
        <div v-for="file in filterListFiles" :key="file?.name" class="file-item" :class="{ active: selectedFile === file?.name }" @click="selectFile(file!)">
          <div v-if="file === null" class="no-files">
            <p>沒有可用的文件</p>
          </div>
          <div v-else>
            <div class="file-name">{{ file.name }}</div>
            <div class="file-info">起始位置: {{ file.start }} | 大小: {{ file.offset }}</div>
          </div>
        </div>
      </div>
    </section>
    <section class="pack-view">
      <div class="header">
        <h3>文件預覽</h3>
        <div v-if="selectedFile" class="detail-info">
          <i class="bi bi-clipboard-fill copy-icon" @click="copyToClipboard">複製</i>
          <i class="bi bi-download download-icon" @click="downloadFile">下載</i>
          <span>當前選擇: {{ selectedFile }}</span>
        </div>
      </div>
      <div class="preview-content">
        <div v-if="selectedFile" class="preview">
          <div v-if="previewImageUrl" class="image-preview">
            <img :src="previewImageUrl" :alt="selectedFile" />
            <div class="image-info">
              <span>W: {{ imageInfo.width }}px | H: {{ imageInfo.height }}px | Size: {{ imageInfo.size }} Kib</span>
            </div>
          </div>
          <div v-else>
            <Code :code="previewContent!" :language="selectedFile.split('.').pop()" />
          </div>
        </div>
        <div v-else class="no-files">
          <p>未選擇文件</p>
        </div>
      </div>
    </section>
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

.wrapper {
  flex: 1;
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--bg-primary);
}

section {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  box-sizing: border-box;
  overflow: hidden;
}

.list-view {
  flex: 1;
}

.pack-view {
  flex: 2;
}

.header {
  display: flex;
  border: 2px solid var(--border-color);
  padding: 8px 18px;
  justify-content: space-between;
  background: var(--bg-secondary);
}

.header h3 {
  color: var(--text-primary);
  font-size: 20px;
}

.detail-info {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 2px 12px;
  font-size: 16px;
  font-weight: 500;
}

.no-files {
  flex: 1;
  height: 100%;
  display: flex;
  padding: 24px;
  justify-content: center;
  align-items: center;
  color: var(--text-muted);
}

.file-list,
.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  max-height: 100%;
}

.file-item {
  padding: 0.75rem 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  background: var(--bg-primary);
}

.file-item:hover {
  background: var(--bg-hover);
  border-color: var(--accent-color-light);
  transform: translateX(6px);
  box-shadow: var(--shadow-md);
}

.file-item.active {
  background: var(--accent-bg);
  border-color: var(--accent-color);
  box-shadow: var(--shadow-accent);
}

.file-name {
  margin-bottom: 0.3rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-primary);
  overflow: hidden;
}

.file-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

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
